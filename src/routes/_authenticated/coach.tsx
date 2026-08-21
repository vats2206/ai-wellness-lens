import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Send, Sparkles } from "lucide-react";
import { fetchScans, recommendationsOf } from "@/lib/scan-data";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/_authenticated/coach")({ component: CoachPage });

type Message = { role: "user" | "assistant"; content: string };
function reply(question: string, score: number | null, tips: string[]) {
  const q = question.toLowerCase();
  if (!score) return "Start with a first scan and a few lifestyle details. I’ll then help you turn the results into small, sustainable habits.";
  if (q.includes("score") || q.includes("change")) return `Your latest wellness score is ${score}. Scores are directional wellness signals, not a diagnosis. Compare several consistent scans and focus on the habits you can repeat.`;
  if (q.includes("sleep")) return "For the next seven days, aim for a consistent sleep and wake time. Note how your energy and fatigue indicators change before chasing a perfect number.";
  if (q.includes("stress")) return "Try one small reset you can repeat daily: a ten-minute walk, a short breathing break, or a screen-free wind-down. Consistency matters more than intensity.";
  return tips[0] ? `${tips[0]} Keep it practical: choose one action for this week, then reassess with your next scan.` : "Choose one supportive habit this week—hydration, a steadier sleep time, movement, or a short stress reset. Your next scan will provide a useful comparison point.";
}
function CoachPage() {
  const scans = useQuery({ queryKey: ["scans"], queryFn: fetchScans });
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const latest = (scans.data ?? []).find((scan) => scan.status === "complete");
  const tips = latest ? recommendationsOf(latest).map((item) => item.detail) : [];
  const send = (e: React.FormEvent) => {
    e.preventDefault();
    const text = message.trim();
    if (!text) return;
    setMessages((current) => [...current, { role: "user", content: text }, { role: "assistant", content: reply(text, latest?.wellness_score ?? null, tips) }]);
    setMessage("");
  };
  return <div className="animate-fade-rise mx-auto max-w-3xl space-y-5">
    <div><p className="text-xs tracking-[0.3em] text-muted-foreground uppercase">Wellness Coach</p><h1 className="font-display mt-3 text-4xl sm:text-5xl">A calmer next step.</h1><p className="mt-3 text-sm text-muted-foreground">Private, in-app guidance based on your latest report. It is not medical advice.</p></div>
    <section className="glass-card min-h-96 p-6 sm:p-8">
      {messages.length ? <div className="space-y-4">{messages.map((item, index) => <article key={index} className={item.role === "user" ? "ml-auto max-w-[85%] rounded-2xl bg-white p-4 text-sm text-black" : "glass max-w-[85%] rounded-2xl p-4 text-sm text-muted-foreground"}>{item.content}</article>)}</div> : <div className="flex min-h-72 flex-col items-center justify-center text-center"><Sparkles className="size-6 text-muted-foreground" /><h2 className="font-display mt-5 text-3xl">Your coach is ready.</h2><p className="mt-3 max-w-md text-sm text-muted-foreground">Ask about your score, a habit, sleep, or stress. Your conversations stay in this browser.</p></div>}
    </section>
    <form onSubmit={send} className="glass-card flex gap-3 p-3"><Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Ask your wellness coach…" className="min-h-12 flex-1 border-0 bg-transparent" /><Button type="submit" disabled={!message.trim()} className="rounded-full bg-primary text-primary-foreground"><Send className="size-4" /><span className="sr-only">Send</span></Button></form>
  </div>;
}