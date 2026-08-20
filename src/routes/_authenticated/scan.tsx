import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Upload, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { analyzeScan } from "@/lib/scans.functions";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";

export const Route = createFileRoute("/_authenticated/scan")({
  head: () => ({
    meta: [
      { title: "New Scan — VISION-FIT®" },
      {
        name: "description",
        content: "Upload a photo and complete the wellness questionnaire to generate an AI report.",
      },
      { property: "og:title", content: "New Scan — VISION-FIT®" },
      { property: "og:description", content: "Run a new AI facial wellness scan." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ScanPage,
});

const sliders = [
  { key: "sleep_hours", label: "Average sleep (hours)", min: 3, max: 10, step: 0.5, initial: 7 },
  { key: "water_litres", label: "Water per day (litres)", min: 0.5, max: 5, step: 0.5, initial: 2 },
  { key: "stress_level", label: "Stress level (1–10)", min: 1, max: 10, step: 1, initial: 5 },
  { key: "exercise_days", label: "Exercise days per week", min: 0, max: 7, step: 1, initial: 3 },
  { key: "screen_hours", label: "Screen time (hours/day)", min: 1, max: 16, step: 1, initial: 7 },
] as const;

async function compress(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const maxSide = 1024;
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return new Promise<Blob>((resolve) =>
    canvas.toBlob((b) => resolve(b ?? file), "image/jpeg", 0.85),
  );
}

function ScanPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const runAnalysis = useServerFn(analyzeScan);

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [values, setValues] = useState<Record<string, number>>(
    Object.fromEntries(sliders.map((s) => [s.key, s.initial])),
  );
  const [concerns, setConcerns] = useState("");
  const [step, setStep] = useState<"idle" | "uploading" | "analyzing">("idle");

  const onFile = (f: File | null) => {
    setFile(f);
    setPreview(f ? URL.createObjectURL(f) : null);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!file) {
      toast.error("Please upload a clear, well-lit selfie first.");
      return;
    }
    try {
      setStep("uploading");
      const blob = await compress(file);
      const path = `${user.id}/${crypto.randomUUID()}.jpg`;
      const { error: upErr } = await supabase.storage
        .from("scans")
        .upload(path, blob, { contentType: "image/jpeg" });
      if (upErr) throw upErr;

      const { data: scan, error: insErr } = await supabase
        .from("scans")
        .insert({
          user_id: user.id,
          image_path: path,
          status: "analyzing",
          questionnaire: { ...values, concerns },
        })
        .select("id")
        .single();
      if (insErr) throw insErr;

      setStep("analyzing");
      await runAnalysis({ data: { scanId: scan.id } });
      toast.success("Your report is ready.");
      navigate({ to: "/reports/$scanId", params: { scanId: scan.id } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Scan failed");
      setStep("idle");
    }
  };

  const busy = step !== "idle";

  return (
    <div className="animate-fade-rise">
      <p className="text-xs tracking-[0.3em] text-muted-foreground uppercase">New Scan</p>
      <h1 className="font-display mt-3 text-4xl sm:text-5xl">
        Capture, answer, <span className="text-muted-foreground italic">analyse.</span>
      </h1>

      <form onSubmit={submit} className="mt-10 grid gap-5 lg:grid-cols-2">
        <section className="glass-card p-8">
          <h2 className="font-display text-2xl">1. Your photo</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Face the light, neutral expression, no filters.
          </p>
          <label className="glass mt-6 flex aspect-4/3 cursor-pointer items-center justify-center overflow-hidden rounded-2xl transition-colors hover:bg-white/10">
            {preview ? (
              <img src={preview} alt="Scan preview" className="h-full w-full object-cover" />
            ) : (
              <span className="flex flex-col items-center text-sm text-muted-foreground">
                <Upload className="mb-3 size-5" />
                Choose or capture a photo
              </span>
            )}
            <input
              type="file"
              accept="image/*"
              capture="user"
              className="hidden"
              onChange={(e) => onFile(e.target.files?.[0] ?? null)}
            />
          </label>
        </section>

        <section className="glass-card p-8">
          <h2 className="font-display text-2xl">2. Wellness questionnaire</h2>
          <div className="mt-6 space-y-6">
            {sliders.map((s) => (
              <div key={s.key}>
                <div className="flex items-center justify-between text-sm">
                  <Label className="text-muted-foreground">{s.label}</Label>
                  <span className="tabular-nums">{values[s.key]}</span>
                </div>
                <Slider
                  className="mt-3"
                  min={s.min}
                  max={s.max}
                  step={s.step}
                  value={[values[s.key] ?? s.initial]}
                  onValueChange={([v]) => setValues((prev) => ({ ...prev, [s.key]: v ?? 0 }))}
                />
              </div>
            ))}
            <div>
              <Label htmlFor="concerns" className="text-sm text-muted-foreground">
                Anything you'd like the analysis to focus on?
              </Label>
              <Textarea
                id="concerns"
                value={concerns}
                onChange={(e) => setConcerns(e.target.value)}
                placeholder="Dark circles after travel, dryness in winter…"
                className="glass mt-3 min-h-24 rounded-2xl border-0 text-foreground"
              />
            </div>
          </div>
        </section>

        <div className="lg:col-span-2">
          <Button
            type="submit"
            disabled={busy}
            size="lg"
            className="w-full rounded-full bg-primary text-primary-foreground transition-transform duration-300 hover:scale-[1.01] hover:bg-primary/90 active:scale-95 sm:w-auto sm:px-10"
          >
            {busy && <Loader2 className="mr-2 size-4 animate-spin" />}
            {step === "uploading"
              ? "Uploading photo…"
              : step === "analyzing"
                ? "Analysing your scan…"
                : "Run analysis"}
          </Button>
          {step === "analyzing" && (
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="glass rounded-2xl p-5">
                  <div className="skeleton-glass h-3 w-20" />
                  <div className="skeleton-glass mt-4 h-8 w-24" />
                </div>
              ))}
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
