import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const searchSchema = z.object({ redirect: z.string().optional() });

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Sign in — VISION-FIT®" },
      {
        name: "description",
        content: "Create your VISION-FIT account or sign in to run AI facial wellness scans.",
      },
      { property: "og:title", content: "Sign in — VISION-FIT®" },
      { property: "og:description", content: "Access your AI facial wellness dashboard." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { redirect } = Route.useSearch();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);

  const target = redirect && redirect.startsWith("/") ? redirect : "/dashboard";

  useEffect(() => {
    if (!loading && user) navigate({ to: target, replace: true });
  }, [loading, user, navigate, target]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
            emailRedirectTo: window.location.origin + target,
          },
        });
        if (error) throw error;
        toast.success("Account created. Welcome to Vision-Fit.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Signed in.");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error(result.error.message ?? "Google sign-in failed");
      setBusy(false);
      return;
    }
    if (result.redirected) return;
    navigate({ to: target });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-5 py-16">
      <div className="glass-card animate-fade-rise w-full max-w-md p-8 sm:p-10">
        <Link to="/" className="font-display text-lg">
          VISION-FIT<span className="align-super text-[0.6em] text-muted-foreground">®</span>
        </Link>
        <h1 className="font-display mt-8 text-4xl leading-tight">
          {mode === "signin" ? "Welcome back." : "Create your account."}
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {mode === "signin"
            ? "Sign in to continue your wellness timeline."
            : "One scan today, a year of clarity ahead."}
        </p>

        <form onSubmit={submit} className="mt-8 space-y-4">
          {mode === "signup" && (
            <div>
              <Label htmlFor="name" className="text-xs text-muted-foreground">
                Full name
              </Label>
              <Input
                id="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="glass mt-2 rounded-xl border-0 text-foreground"
                placeholder="Ada Lovelace"
              />
            </div>
          )}
          <div>
            <Label htmlFor="email" className="text-xs text-muted-foreground">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="glass mt-2 rounded-xl border-0 text-foreground"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <Label htmlFor="password" className="text-xs text-muted-foreground">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="glass mt-2 rounded-xl border-0 text-foreground"
              placeholder="••••••••"
            />
          </div>
          <Button
            type="submit"
            disabled={busy}
            className="w-full rounded-full bg-primary text-primary-foreground transition-transform duration-300 hover:scale-[1.02] hover:bg-primary/90 active:scale-95"
          >
            {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
          </Button>
        </form>

        <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
        </div>

        <Button
          variant="ghost"
          onClick={google}
          disabled={busy}
          className="glass w-full rounded-full text-foreground hover:bg-transparent"
        >
          Continue with Google
        </Button>

        <Button
          variant="ghost"
          onClick={guest}
          disabled={busy}
          className="glass mt-3 w-full rounded-full text-foreground hover:bg-transparent"
        >
          Continue as guest
        </Button>
        <p className="mt-3 text-center text-xs text-muted-foreground">
          Guest mode unlocks every feature. Add an email later to keep your history.
        </p>


        <button
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="mt-6 w-full text-center text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          {mode === "signin"
            ? "No account yet? Create one"
            : "Already have an account? Sign in"}
        </button>
      </div>
    </div>
  );
}
