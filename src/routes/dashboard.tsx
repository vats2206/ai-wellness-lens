import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Sparkles, TrendingUp, Droplets, Moon, ArrowUpRight } from "lucide-react";
import { SiteNav } from "@/components/SiteNav";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — VISION-FIT® Wellness Intelligence" },
      {
        name: "description",
        content:
          "Track your wellness score, scan history, AI recommendations and weekly trends inside the VISION-FIT dashboard.",
      },
      { property: "og:title", content: "VISION-FIT® Dashboard" },
      {
        property: "og:description",
        content: "Wellness score, scan history, AI recommendations and weekly progress trends.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

const scans = [
  { date: "Aug 18", score: 86, note: "Hydration improved" },
  { date: "Aug 11", score: 81, note: "Elevated fatigue load" },
  { date: "Aug 04", score: 78, note: "Baseline re-established" },
  { date: "Jul 28", score: 74, note: "Post-travel recovery" },
];

const trends = [58, 64, 61, 70, 74, 81, 86];

const recommendations = [
  { icon: Droplets, title: "Raise evening hydration", body: "+500ml before 8pm for 5 days." },
  { icon: Moon, title: "Protect sleep window", body: "Target 23:15 lights-out to lower fatigue." },
  { icon: Sparkles, title: "Barrier repair", body: "Add ceramide serum on scan days." },
];

function Dashboard() {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 900);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <main className="mx-auto max-w-6xl px-6 pt-32 pb-24">
        <div className="animate-fade-rise flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs tracking-[0.3em] text-muted-foreground uppercase">Dashboard</p>
            <h1 className="font-display mt-3 text-4xl sm:text-5xl">
              Good evening, <span className="text-muted-foreground italic">Abhinav.</span>
            </h1>
          </div>
          <Button className="rounded-full bg-primary px-6 text-primary-foreground transition-transform duration-300 hover:scale-[1.03] hover:bg-primary/90 active:scale-95">
            New Scan
          </Button>
        </div>

        {loading ? (
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="glass rounded-3xl p-7">
                <div className="skeleton-glass h-4 w-24" />
                <div className="skeleton-glass mt-5 h-10 w-32" />
                <div className="skeleton-glass mt-4 h-3 w-full" />
                <div className="skeleton-glass mt-2 h-3 w-2/3" />
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            <section
              className="glass-card animate-fade-rise p-8 lg:col-span-2"
              style={{ animationDelay: "60ms" }}
            >
              <p className="text-sm text-muted-foreground">Wellness Score</p>
              <div className="mt-4 flex items-end gap-4">
                <span className="font-display text-7xl leading-none">86</span>
                <span className="mb-2 inline-flex items-center text-sm text-muted-foreground">
                  <TrendingUp className="mr-1 size-4" /> +5 this week
                </span>
              </div>
              <div className="mt-8 grid grid-cols-3 gap-4">
                {[
                  ["Hydration", 82],
                  ["Recovery", 68],
                  ["Clarity", 91],
                ].map(([l, v]) => (
                  <div key={l as string} className="glass rounded-2xl p-4">
                    <p className="text-xs text-muted-foreground">{l}</p>
                    <p className="mt-2 font-display text-2xl tabular-nums">{v}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="glass-card animate-fade-rise p-8" style={{ animationDelay: "120ms" }}>
              <p className="text-sm text-muted-foreground">Profile Summary</p>
              <div className="mt-5 flex items-center gap-4">
                <div className="glass-strong flex size-14 items-center justify-center rounded-full font-display text-xl">
                  AV
                </div>
                <div>
                  <p className="text-base">Abhinav Vats</p>
                  <p className="text-xs text-muted-foreground">Pro member · 14 scans</p>
                </div>
              </div>
              <dl className="mt-7 space-y-3 text-sm">
                {[
                  ["Streak", "6 weeks"],
                  ["Next scan", "Aug 25"],
                  ["Baseline", "74"],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between">
                    <dt className="text-muted-foreground">{k}</dt>
                    <dd className="tabular-nums">{v}</dd>
                  </div>
                ))}
              </dl>
            </section>

            <section
              className="glass-card animate-fade-rise p-8 lg:col-span-2"
              style={{ animationDelay: "180ms" }}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Weekly Trends</p>
                <span className="text-xs text-muted-foreground">Last 7 weeks</span>
              </div>
              <div className="mt-8 flex h-44 items-end gap-3">
                {trends.map((v, i) => (
                  <div key={i} className="flex flex-1 flex-col items-center gap-3">
                    <div
                      className="w-full rounded-t-lg bg-primary/80 transition-all duration-700 hover:bg-primary"
                      style={{ height: `${v}%` }}
                    />
                    <span className="text-[10px] text-muted-foreground">W{i + 1}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="glass-card animate-fade-rise p-8" style={{ animationDelay: "240ms" }}>
              <p className="text-sm text-muted-foreground">AI Recommendations</p>
              <ul className="mt-5 space-y-4">
                {recommendations.map((r) => (
                  <li key={r.title} className="glass rounded-2xl p-4">
                    <r.icon className="size-4 text-muted-foreground" />
                    <p className="mt-3 text-sm">{r.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{r.body}</p>
                  </li>
                ))}
              </ul>
            </section>

            <section
              className="glass-card animate-fade-rise p-8 lg:col-span-3"
              style={{ animationDelay: "300ms" }}
            >
              <p className="text-sm text-muted-foreground">Scan History</p>
              <ul className="mt-5 divide-y divide-border/60">
                {scans.map((s) => (
                  <li
                    key={s.date}
                    className="group flex items-center justify-between py-4 transition-colors hover:text-foreground"
                  >
                    <div>
                      <p className="text-sm">{s.date}</p>
                      <p className="text-xs text-muted-foreground">{s.note}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-display text-2xl tabular-nums">{s.score}</span>
                      <ArrowUpRight className="size-4 text-muted-foreground transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
