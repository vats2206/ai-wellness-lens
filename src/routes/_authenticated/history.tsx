import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchScans, formatDate } from "@/lib/scan-data";

export const Route = createFileRoute("/_authenticated/history")({
  head: () => ({
    meta: [
      { title: "Scan History — VISION-FIT®" },
      { name: "description", content: "Every wellness scan you've run, with scores and reports." },
      { property: "og:title", content: "Scan History — VISION-FIT®" },
      { property: "og:description", content: "Your complete scan timeline." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  const { data, isLoading } = useQuery({ queryKey: ["scans"], queryFn: fetchScans });
  const scans = data ?? [];

  return (
    <div className="animate-fade-rise">
      <p className="text-xs tracking-[0.3em] text-muted-foreground uppercase">History</p>
      <h1 className="font-display mt-3 text-4xl sm:text-5xl">
        Your <span className="text-muted-foreground italic">timeline.</span>
      </h1>

      <div className="mt-10 space-y-3">
        {isLoading &&
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass rounded-2xl p-6">
              <div className="skeleton-glass h-4 w-40" />
            </div>
          ))}

        {!isLoading && scans.length === 0 && (
          <div className="glass-card p-10 text-center">
            <p className="text-muted-foreground">No scans recorded yet.</p>
            <Button asChild className="mt-6 rounded-full bg-primary text-primary-foreground">
              <Link to="/scan">Run your first scan</Link>
            </Button>
          </div>
        )}

        {scans.map((s) => (
          <Link
            key={s.id}
            to="/reports/$scanId"
            params={{ scanId: s.id }}
            className="glass-card flex flex-wrap items-center justify-between gap-4 p-6"
          >
            <div>
              <p className="text-base">{formatDate(s.created_at)}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {s.status === "complete"
                  ? (s.summary?.slice(0, 90) ?? "Report ready")
                  : s.status === "failed"
                    ? (s.error ?? "Analysis failed")
                    : "Analysis in progress"}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-display text-3xl">
                {s.status === "complete" ? s.wellness_score : "—"}
              </span>
              <ArrowUpRight className="size-4 text-muted-foreground" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
