import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Send, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { askWellnessCoach } from "@/lib/coach.functions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/_authenticated/coach")({ component: CoachPage });

function CoachPage() {
  const { user } = useAuth();
  const ask = useServerFn(askWellnessCoach);
  const [message, setMessage] = useState("");
  const messages = useQuery({ queryKey: ["coach", user?.id], enabled: !!user, queryFn: async () => {
    const { data, error } = await supabase.from("coach_messages").select("*").order("created_at", { ascending: true }).limit(40);
    if (error) throw error;
    return data;
  }});
  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = message.trim();
    if (!text || ask.pending) return;
    setMessage("");
    await ask({ data: { message: text } });
    await messages.refetch();
  };
  return <div className="animate-fade-rise mx-auto max-w-3xl space-y-5">
    <div><p className="text-xs tracking-[0.3em] text-muted-foreground uppercase">AI Wellness Coach</p><h1 className="font-display mt-3 text-4xl sm:text-5xl">A calmer next step.</h1><p className="mt-3 text-sm text-muted-foreground">Ask about your report, score changes, habits, or sustainable progress. This is wellness guidance, not medical advice.</p></div>
    <section className="glass-card min-h-96 p-6 sm:p-8">
      {messages.isLoading ? <div className="skeleton-glass h-32 rounded-2xl" /> : messages.data?.length ? <div className="space-y-4">{messages.data.map((item) => <article key={item.id} className={item.role === "user" ? "ml-auto max-w-[85%] rounded-2xl bg-white p-4 text-sm text-black" : "glass max-w-[85%] rounded-2xl p-4 text-sm text-muted-foreground"}>{item.content}</article>)}</div> : <div className="flex min-h-72 flex-col items-center justify-center text-center"><Sparkles className="size-6 text-muted-foreground" /><h2 className="font-display mt-5 text-3xl">Your coach is ready.</h2><p className="mt-3 max-w-md text-sm text-muted-foreground">Try “What is influencing my score?” after your first completed scan.</p></div>}
    </section>
    <form onSubmit={send} className="glass-card flex gap-3 p-3"><Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Ask your wellness coach…" className="min-h-12 flex-1 border-0 bg-transparent" /><Button type="submit" disabled={ask.pending || !message.trim()} className="rounded-full bg-primary text-primary-foreground"><Send className="size-4" /><span className="sr-only">Send</span></Button></form>
  </div>;
}