import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, Sparkles } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import {
  fetchProfile,
  fetchScans,
  formatDate,
  metricsOf,
  recommendationsOf,
} from "@/lib/scan-data";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — VISION-FIT®" },
      {
        name: "description",
        content: "Track your wellness score, weekly trends and AI recommendations.",
      },
      { property: "og:title", content: "Dashboard — VISION-FIT®" },
      { property: "og:description", content: "Your facial wellness command centre." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { user } = useAuth();
  const scansQuery = useQuery({ queryKey: ["scans"], queryFn: fetchScans });
  const profileQuery = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: () => fetchProfile(user!.id),
    enabled: !!user,
  });

  const scans = scansQuery.data ?? [];
  const completed = scans.filter((s) => s.status === "complete");
  const latest = completed[0];
  const previous = completed[1];
  const delta =
    latest?.wellness_score != null && previous?.wellness_score != null
      ? latest.wellness_score - previous.wellness_score
      : null;

  const chartData = [...completed]
    .reverse()
    .map((s) => ({ date: formatDate(s.created_at), score: s.wellness_score ?? 0 }));

  if (scansQuery.isLoading) {
    return (
      <div className="grid gap-5 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="glass rounded-3xl p-8">
            <div className="skeleton-glass h-3 w-24" />
            <div className="skeleton-glass mt-5 h-10 w-32" />
            <div className="skeleton-glass mt-4 h-3 w-full" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="animate-fade-rise space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs tracking-[0.3em] text-muted-foreground uppercase">Dashboard</p>
          <h1 className="font-display mt-3 text-4xl sm:text-5xl">
            Hello, {profileQuery.data?.full_name?.split(" ")[0] ?? "there"}.
          </h1>
        </div>
        <Button
          asChild
          className="rounded-full bg-primary text-primary-foreground transition-transform duration-300 hover:scale-[1.03] hover:bg-primary/90 active:scale-95"
        >
          <Link to="/scan">New scan</Link>
        </Button>
      </div>

      {completed.length === 0 ? (
        <div className="glass-card p-10 text-center">
          <Sparkles className="mx-auto size-6 text-muted-foreground" />
          <h2 className="font-display mt-5 text-3xl">No scans yet.</h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
            Run your first facial wellness scan to unlock your score, trends and personalised
            recommendations.
          </p>
          <Button asChild className="mt-7 rounded-full bg-primary text-primary-foreground">
            <Link to="/scan">Start your scan</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-3">
          <section className="glass-card p-8 lg:col-span-1">
            <p className="text-xs tracking-[0.25em] text-muted-foreground uppercase">
              Wellness score
            </p>
            <p className="font-display mt-6 text-7xl leading-none">{latest?.wellness_score}</p>
            <p className="mt-4 text-sm text-muted-foreground">
              {delta === null
                ? "Baseline established."
                : delta >= 0
                  ? `+${delta} points since your last scan.`
                  : `${delta} points since your last scan.`}
            </p>
            <div className="mt-6 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-foreground transition-all duration-1000"
                style={{ width: `${latest?.wellness_score ?? 0}%` }}
              />
            </div>
          </section>

          <section className="glass-card p-8 lg:col-span-2">
            <p className="text-xs tracking-[0.25em] text-muted-foreground uppercase">
              Weekly trend
            </p>
            <div className="mt-6 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="score" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="hsl(0 0% 100% / 0.08)" vertical={false} />
                  <XAxis dataKey="date" stroke="var(--color-muted-foreground)" fontSize={11} />
                  <YAxis domain={[0, 100]} stroke="var(--color-muted-foreground)" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(201 60% 12%)",
                      border: "1px solid hsl(0 0% 100% / 0.14)",
                      borderRadius: 12,
                      color: "white",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="var(--color-chart-1)"
                    strokeWidth={2}
                    fill="url(#score)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="glass-card p-8 lg:col-span-2">
            <p className="text-xs tracking-[0.25em] text-muted-foreground uppercase">
              AI recommendations
            </p>
            <ul className="mt-6 space-y-4">
              {latest &&
                recommendationsOf(latest).map((r) => (
                  <li key={r.title} className="glass rounded-2xl p-5">
                    <p className="text-xs text-muted-foreground">{r.category}</p>
                    <p className="mt-1 text-base">{r.title}</p>
                    <p className="mt-2 text-sm text-muted-foreground">{r.detail}</p>
                  </li>
                ))}
            </ul>
          </section>

          <div className="space-y-5">
            <section className="glass-card p-8">
              <p className="text-xs tracking-[0.25em] text-muted-foreground uppercase">
                Latest metrics
              </p>
              <ul className="mt-6 space-y-4">
                {latest &&
                  metricsOf(latest).map((m) => (
                    <li key={m.label}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{m.label}</span>
                        <span className="tabular-nums">{m.score}</span>
                      </div>
                      <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-foreground/70"
                          style={{ width: `${m.score}%` }}
                        />
                      </div>
                    </li>
                  ))}
              </ul>
            </section>

            <section className="glass-card p-8">
              <div className="flex items-center justify-between">
                <p className="text-xs tracking-[0.25em] text-muted-foreground uppercase">
                  Scan history
                </p>
                <Link
                  to="/history"
                  className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                >
                  View all
                </Link>
              </div>
              <ul className="mt-6 space-y-3">
                {scans.slice(0, 4).map((s) => (
                  <li key={s.id}>
                    <Link
                      to="/reports/$scanId"
                      params={{ scanId: s.id }}
                      className="glass flex items-center justify-between rounded-2xl px-5 py-4 transition-transform duration-300 hover:translate-x-1"
                    >
                      <span className="text-sm text-muted-foreground">
                        {formatDate(s.created_at)}
                      </span>
                      <span className="flex items-center gap-2 text-sm">
                        {s.status === "complete" ? s.wellness_score : s.status}
                        <ArrowUpRight className="size-3.5 text-muted-foreground" />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>

            <section className="glass-card p-8">
              <p className="text-xs tracking-[0.25em] text-muted-foreground uppercase">Profile</p>
              <p className="mt-5 text-lg">{profileQuery.data?.full_name ?? "Unnamed"}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <p className="mt-4 text-sm text-muted-foreground">
                {completed.length} completed scan{completed.length === 1 ? "" : "s"}
              </p>
              <Link
                to="/profile"
                className="mt-5 inline-block text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Edit profile →
              </Link>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
