import { createFileRoute, Link } from "@tanstack/react-router";
import { ScanFace, Sparkles, LineChart, ShieldCheck, Play, ArrowRight } from "lucide-react";
import { SiteNav } from "@/components/SiteNav";
import { Button } from "@/components/ui/button";
import heroVideo from "../../public/hero.mp4.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VISION-FIT® — AI Facial Wellness Insights" },
      {
        name: "description",
        content:
          "AI-powered facial wellness insights, personalized recommendations, and long-term progress tracking in one intelligent platform.",
      },
      { property: "og:title", content: "VISION-FIT® — See Wellness Differently" },
      {
        property: "og:description",
        content:
          "AI-powered facial wellness insights, personalized recommendations, and long-term progress tracking.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const features = [
  {
    icon: ScanFace,
    title: "Precision Facial Scan",
    body: "A 30-second capture maps over 120 wellness signals with clinical-grade consistency.",
  },
  {
    icon: Sparkles,
    title: "Personalized Protocols",
    body: "Recommendations adapt weekly to your sleep, hydration, stress and recovery patterns.",
  },
  {
    icon: LineChart,
    title: "Longitudinal Tracking",
    body: "Every scan becomes a datapoint, revealing trends long before you can feel them.",
  },
  {
    icon: ShieldCheck,
    title: "Private by Architecture",
    body: "On-device pre-processing and encrypted storage. Your face never becomes a product.",
  },
];

const tiers = [
  { name: "Essential", price: "$0", note: "Monthly scan and baseline score.", cta: "Start Free" },
  {
    name: "Pro",
    price: "$24",
    note: "Unlimited scans, AI protocols, weekly trends.",
    cta: "Go Pro",
    featured: true,
  },
  { name: "Clinic", price: "Custom", note: "Multi-user cohorts and API access.", cta: "Talk to us" },
];

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <SiteNav />

      <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 z-0 h-full w-full object-cover"
          src={heroVideo.url}
        />
        <div className="relative z-10 mx-auto max-w-4xl px-6 py-32 text-center">
          <p className="animate-fade-rise text-xs tracking-[0.35em] text-muted-foreground uppercase">
            AI Facial Wellness
          </p>
          <h1
            className="animate-fade-rise font-display mt-6 text-5xl leading-[1.05] tracking-tight sm:text-7xl lg:text-8xl"
            style={{ animationDelay: "120ms" }}
          >
            See Wellness <span className="text-muted-foreground italic">Differently.</span>
          </h1>
          <p
            className="animate-fade-rise mx-auto mt-7 max-w-2xl text-base text-muted-foreground sm:text-lg"
            style={{ animationDelay: "240ms" }}
          >
            AI-powered facial wellness insights, personalized recommendations, and long-term
            progress tracking—all in one intelligent platform.
          </p>
          <div
            className="animate-fade-rise mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
            style={{ animationDelay: "360ms" }}
          >
            <Button
              size="lg"
              className="w-full rounded-full bg-primary px-8 text-primary-foreground transition-transform duration-300 hover:scale-[1.03] hover:bg-primary/90 active:scale-95 sm:w-auto"
            >
              Start Your Scan
            </Button>
            <Button
              size="lg"
              variant="ghost"
              className="glass w-full rounded-full px-8 text-foreground transition-transform duration-300 hover:scale-[1.03] hover:bg-transparent active:scale-95 sm:w-auto"
            >
              <Play className="mr-2 size-4" /> Watch Demo
            </Button>
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-6xl px-6 py-28">
        <h2 className="font-display max-w-2xl text-4xl leading-tight sm:text-5xl">
          Built for people who measure <span className="text-muted-foreground italic">what matters.</span>
        </h2>
        <div className="mt-14 grid gap-5 sm:grid-cols-2">
          {features.map((f) => (
            <article key={f.title} className="glass-card p-7">
              <f.icon className="size-5 text-muted-foreground" />
              <h3 className="font-display mt-5 text-2xl">{f.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="ai-analysis" className="mx-auto max-w-6xl px-6 py-20">
        <div className="glass-card grid gap-10 p-8 sm:p-12 lg:grid-cols-2">
          <div>
            <p className="text-xs tracking-[0.3em] text-muted-foreground uppercase">AI Analysis</p>
            <h2 className="font-display mt-5 text-4xl leading-tight sm:text-5xl">
              A model that reads <span className="text-muted-foreground italic">nuance.</span>
            </h2>
            <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
              Vision-Fit's ensemble evaluates skin tone uniformity, periorbital fatigue, hydration
              and inflammation markers, then contextualizes them against your own history—not a
              population average.
            </p>
            <Link
              to="/dashboard"
              className="mt-8 inline-flex items-center text-sm text-foreground transition-opacity hover:opacity-70"
            >
              Explore the dashboard <ArrowRight className="ml-2 size-4" />
            </Link>
          </div>
          <div className="space-y-4">
            {[
              ["Hydration", 82],
              ["Recovery", 68],
              ["Skin Clarity", 91],
              ["Fatigue Load", 44],
            ].map(([label, value]) => (
              <div key={label as string} className="glass rounded-2xl p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="tabular-nums">{value}</span>
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-[width] duration-1000"
                    style={{ width: `${value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-6xl px-6 py-28">
        <h2 className="font-display text-4xl sm:text-5xl">
          Pricing, <span className="text-muted-foreground italic">simply.</span>
        </h2>
        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          {tiers.map((t) => (
            <div
              key={t.name}
              className={`glass-card flex flex-col p-8 ${t.featured ? "ring-1 ring-white/25" : ""}`}
            >
              <p className="text-sm text-muted-foreground">{t.name}</p>
              <p className="font-display mt-4 text-5xl">
                {t.price}
                {t.price.startsWith("$") && t.price !== "$0" && (
                  <span className="text-base text-muted-foreground">/mo</span>
                )}
              </p>
              <p className="mt-4 flex-1 text-sm text-muted-foreground">{t.note}</p>
              <Button
                variant={t.featured ? "default" : "ghost"}
                className={`mt-8 rounded-full transition-transform duration-300 hover:scale-[1.03] active:scale-95 ${
                  t.featured
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "glass text-foreground hover:bg-transparent"
                }`}
              >
                {t.cta}
              </Button>
            </div>
          ))}
        </div>
      </section>

      <section id="contact" className="mx-auto max-w-6xl px-6 pb-28">
        <div className="glass-card p-10 text-center sm:p-16">
          <h2 className="font-display text-4xl sm:text-5xl">
            Start with a single <span className="text-muted-foreground italic">scan.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-sm text-muted-foreground">
            Thirty seconds today becomes a year of clarity. Reach us at hello@vision-fit.ai.
          </p>
          <Button
            size="lg"
            className="mt-9 rounded-full bg-primary px-8 text-primary-foreground transition-transform duration-300 hover:scale-[1.03] hover:bg-primary/90 active:scale-95"
          >
            Start Your Scan
          </Button>
        </div>
      </section>

      <footer className="border-t border-border/60 py-10 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} VISION-FIT®
      </footer>
    </div>
  );
}
