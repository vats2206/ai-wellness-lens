import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const inputSchema = z.object({ scanId: z.string().uuid() });

type Metric = { label: string; score: number; note: string };
type Recommendation = { title: string; detail: string; category: string };

export const analyzeScan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: scan, error: scanError } = await supabase
      .from("scans")
      .select("*")
      .eq("id", data.scanId)
      .eq("user_id", userId)
      .single();

    if (scanError || !scan) throw new Error("Scan not found");

    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) throw new Error("AI is not configured for this project");

    let imageDataUrl: string | null = null;
    if (scan.image_path) {
      const { data: file, error: dlError } = await supabase.storage
        .from("scans")
        .download(scan.image_path);
      if (dlError || !file) throw new Error("Could not read the uploaded photo");
      const bytes = new Uint8Array(await file.arrayBuffer());
      let binary = "";
      for (let i = 0; i < bytes.length; i += 8192) {
        binary += String.fromCharCode(...bytes.subarray(i, i + 8192));
      }
      imageDataUrl = `data:${file.type || "image/jpeg"};base64,${btoa(binary)}`;
    }

    const prompt = `You are Vision-Fit, a facial wellness analysis engine. Analyse the person's selfie together with their self-reported questionnaire and return a wellness assessment.

Questionnaire (JSON):
${JSON.stringify(scan.questionnaire, null, 2)}

Return ONLY valid JSON matching exactly:
{
  "wellness_score": <integer 0-100>,
  "summary": "<2-3 sentence plain-language summary>",
  "metrics": [{"label": "Hydration", "score": <0-100>, "note": "<short note>"}, ... exactly 5 metrics covering Hydration, Recovery, Skin Clarity, Fatigue Load, Stress Balance],
  "recommendations": [{"title": "<short action>", "detail": "<1-2 sentences>", "category": "<Sleep|Hydration|Nutrition|Skincare|Movement|Stress>"}, ... 3 to 5 items]
}
This is general wellness guidance, not medical diagnosis. Never mention that you are an AI model.`;

    const content: Array<Record<string, unknown>> = [{ type: "text", text: prompt }];
    if (imageDataUrl) content.push({ type: "image_url", image_url: { url: imageDataUrl } });

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "google/gemini-3.7-flash",
        messages: [{ role: "user", content }],
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      const message =
        res.status === 429
          ? "AI analysis is rate limited right now. Please try again in a moment."
          : res.status === 402
            ? "AI credits are exhausted for this workspace. Please top up to run new scans."
            : `AI analysis failed (${res.status}). ${body.slice(0, 200)}`;
      await supabase
        .from("scans")
        .update({ status: "failed", error: message })
        .eq("id", scan.id)
        .eq("user_id", userId);
      throw new Error(message);
    }

    const payload = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const raw = payload.choices?.[0]?.message?.content ?? "";
    const jsonText = raw.replace(/```json|```/g, "").trim();

    let parsed: {
      wellness_score: number;
      summary: string;
      metrics: Metric[];
      recommendations: Recommendation[];
    };
    try {
      parsed = JSON.parse(jsonText.slice(jsonText.indexOf("{"), jsonText.lastIndexOf("}") + 1));
    } catch {
      const message = "The analysis came back in an unexpected format. Please try the scan again.";
      await supabase
        .from("scans")
        .update({ status: "failed", error: message })
        .eq("id", scan.id)
        .eq("user_id", userId);
      throw new Error(message);
    }

    const score = Math.max(0, Math.min(100, Math.round(Number(parsed.wellness_score) || 0)));

    const { error: updateError } = await supabase
      .from("scans")
      .update({
        status: "complete",
        wellness_score: score,
        summary: parsed.summary,
        metrics: parsed.metrics as unknown as never,
        recommendations: parsed.recommendations as unknown as never,
        error: null,
      })
      .eq("id", scan.id)
      .eq("user_id", userId);

    if (updateError) throw new Error(updateError.message);

    return { scanId: scan.id, wellnessScore: score };
  });
