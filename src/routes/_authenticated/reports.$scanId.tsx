import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  fetchScan,
  formatDate,
  metricsOf,
  recommendationsOf,
  signedImageUrl,
} from "@/lib/scan-data";

export const Route = createFileRoute("/_authenticated/reports/$scanId")({
  head: () => ({
    meta: [
      { title: "Scan report — VISION-FIT®" },
      {
        name: "description",
        content: "Detailed AI wellness report with metrics, summary and recommendations.",
      },
      { property: "og:title", content: "Scan report — VISION-FIT®" },
      { property: "og:description", content: "Your AI facial wellness analysis in detail." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ReportPage,
});

function ReportPage() {
  const { scanId } = Route.useParams();
  const scanQuery = useQuery({ queryKey: ["scan", scanId], queryFn: () => fetchScan(scanId) });
  const scan = scanQuery.data;
  const imageQuery = useQuery({
    queryKey: ["scan-image", scan?.image_path],
    queryFn: () => signedImageUrl(scan!.image_path),
    enabled: !!scan?.image_path,
  });

  if (scanQuery.isLoading) {
    return <div className="skeleton-glass h-72 w-full rounded-3xl" />;
  }

  if (scanQuery.isError || !scan) {
    return (
      <div className="glass-card p-10 text-center">
        <h1 className="font-display text-3xl">Report unavailable</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          We couldn&apos;t find this scan. It may have been removed.
        </p>
        <Link to="/history" className="mt-6 inline-block text-sm underline">
          Back to history
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-rise space-y-5">
      <div>
        <p className="text-xs tracking-[0.3em] text-muted-foreground uppercase">
          Report · {formatDate(scan.created_at)}
        </p>
        <h1 className="font-display mt-3 text-4xl sm:text-5xl">
          {scan.status === "complete" ? `Wellness score ${scan.wellness_score}` : scan.status}
        </h1>
      </div>

      {scan.status !== "complete" && (
        <div className="glass-card p-8 text-sm text-muted-foreground">
          {scan.error ?? "This scan is still being analysed."}
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-3">
        {imageQuery.data && (
          <section className="glass-card overflow-hidden p-0 lg:col-span-1">
            <img
              src={imageQuery.data}
              alt="Uploaded facial wellness scan"
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </section>
        )}

        <section className="glass-card p-8 lg:col-span-2">
          <p className="text-xs tracking-[0.25em] text-muted-foreground uppercase">Summary</p>
          <p className="mt-5 text-lg leading-relaxed">
            {scan.summary ?? "No summary available yet."}
          </p>
        </section>

        <section className="glass-card p-8 lg:col-span-1">
          <p className="text-xs tracking-[0.25em] text-muted-foreground uppercase">Metrics</p>
          <ul className="mt-6 space-y-4">
            {metricsOf(scan).map((m) => (
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
                <p className="mt-2 text-xs text-muted-foreground">{m.note}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="glass-card p-8 lg:col-span-2">
          <p className="text-xs tracking-[0.25em] text-muted-foreground uppercase">
            Recommendations
          </p>
          <ul className="mt-6 space-y-4">
            {recommendationsOf(scan).map((r) => (
              <li key={r.title} className="glass rounded-2xl p-5">
                <p className="text-xs text-muted-foreground">{r.category}</p>
                <p className="mt-1 text-base">{r.title}</p>
                <p className="mt-2 text-sm text-muted-foreground">{r.detail}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
