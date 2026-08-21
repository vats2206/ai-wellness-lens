import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { fetchProfile } from "@/lib/scan-data";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "Your profile — VISION-FIT®" },
      {
        name: "description",
        content: "Update your name, age, skin type and wellness goals for sharper AI analysis.",
      },
      { property: "og:title", content: "Your profile — VISION-FIT®" },
      { property: "og:description", content: "Personal details that tune your wellness analysis." },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const profileQuery = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: () => fetchProfile(user!.id),
    enabled: !!user,
  });

  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState("");
  const [skinType, setSkinType] = useState("");
  const [goals, setGoals] = useState("");

  useEffect(() => {
    const p = profileQuery.data;
    if (!p) return;
    setFullName(p.full_name ?? "");
    setAge(p.age != null ? String(p.age) : "");
    setSkinType(p.skin_type ?? "");
    setGoals(p.goals ?? "");
  }, [profileQuery.data]);

  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName || null,
          age: age ? Number(age) : null,
          skin_type: skinType || null,
          goals: goals || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Profile updated");
      queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const isGuest = !user?.email;

  const upgrade = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.updateUser({
        email: upgradeEmail,
        password: upgradePassword,
      });
      if (error) throw error;
    },
    onSuccess: () => toast.success("Account saved. You can now sign in with that email."),
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="animate-fade-rise space-y-5">
      <div>
        <p className="text-xs tracking-[0.3em] text-muted-foreground uppercase">Profile</p>
        <h1 className="font-display mt-3 text-4xl sm:text-5xl">Your details</h1>
      </div>

      {isGuest && (
        <form
          className="glass-card max-w-2xl space-y-4 p-8"
          onSubmit={(e) => {
            e.preventDefault();
            upgrade.mutate();
          }}
        >
          <div>
            <p className="text-xs tracking-[0.25em] text-muted-foreground uppercase">Guest mode</p>
            <p className="mt-3 text-sm text-muted-foreground">
              You're exploring as a guest. Add an email and password to keep your scans forever.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="upgradeEmail">Email</Label>
            <Input
              id="upgradeEmail"
              type="email"
              required
              value={upgradeEmail}
              onChange={(e) => setUpgradeEmail(e.target.value)}
              className="glass"
              placeholder="you@example.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="upgradePassword">Password</Label>
            <Input
              id="upgradePassword"
              type="password"
              required
              minLength={6}
              value={upgradePassword}
              onChange={(e) => setUpgradePassword(e.target.value)}
              className="glass"
              placeholder="••••••••"
            />
          </div>
          <Button
            type="submit"
            disabled={upgrade.isPending}
            className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {upgrade.isPending ? "Saving…" : "Save my account"}
          </Button>
        </form>
      )}


      <form
        className="glass-card max-w-2xl space-y-5 p-8"
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate();
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" value={user?.email ?? ""} readOnly className="glass" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="fullName">Full name</Label>
          <Input
            id="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="glass"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="age">Age</Label>
          <Input
            id="age"
            type="number"
            min={1}
            max={120}
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className="glass"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="skinType">Skin type</Label>
          <Input
            id="skinType"
            placeholder="Oily, dry, combination…"
            value={skinType}
            onChange={(e) => setSkinType(e.target.value)}
            className="glass"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="goals">Wellness goals</Label>
          <Textarea
            id="goals"
            rows={4}
            value={goals}
            onChange={(e) => setGoals(e.target.value)}
            className="glass"
          />
        </div>
        <Button
          type="submit"
          disabled={save.isPending}
          className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {save.isPending ? "Saving…" : "Save changes"}
        </Button>
      </form>
    </div>
  );
}
