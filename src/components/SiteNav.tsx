import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const links = [
  { label: "Home", to: "/" as const, hash: undefined },
  { label: "Features", to: "/" as const, hash: "features" },
  { label: "AI Analysis", to: "/" as const, hash: "ai-analysis" },
  { label: "Dashboard", to: "/dashboard" as const, hash: undefined },
  { label: "Pricing", to: "/" as const, hash: "pricing" },
  { label: "Contact", to: "/" as const, hash: "contact" },
];

export function SiteNav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-6">
      <nav
        className={`mx-auto flex max-w-6xl items-center justify-between rounded-full px-5 py-3 transition-all duration-500 ${
          scrolled ? "glass-strong" : "glass"
        }`}
      >
        <Link to="/" className="font-display text-lg tracking-tight sm:text-xl">
          VISION-FIT<span className="align-super text-[0.6em] text-muted-foreground">®</span>
        </Link>

        <ul className="hidden items-center gap-7 lg:flex">
          {links.map((l) => (
            <li key={l.label}>
              <Link
                to={l.to}
                {...(l.hash ? { hash: l.hash } : {})}
                className="text-sm text-muted-foreground transition-colors duration-300 hover:text-foreground"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            className="hidden rounded-full bg-primary px-5 text-primary-foreground transition-transform duration-300 hover:scale-[1.03] hover:bg-primary/90 active:scale-95 sm:inline-flex"
          >
            Start Your Scan
          </Button>
          <button
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
            className="rounded-full p-2 text-foreground transition-colors hover:bg-accent/40 lg:hidden"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="glass-strong animate-fade-in mx-auto mt-2 max-w-6xl rounded-3xl p-5 lg:hidden">
          <ul className="flex flex-col gap-4">
            {links.map((l) => (
              <li key={l.label}>
                <Link
                  to={l.to}
                  {...(l.hash ? { hash: l.hash } : {})}
                  onClick={() => setOpen(false)}
                  className="text-base text-muted-foreground transition-colors hover:text-foreground"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <Button className="mt-5 w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
            Start Your Scan
          </Button>
        </div>
      )}
    </header>
  );
}
