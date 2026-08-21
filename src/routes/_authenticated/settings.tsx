import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { fetchProfile } from "@/lib/scan-data";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Settings — VISION-FIT®" },
      {
        name: "description",
        content: "Manage notifications, weekly reminders, password and your VISION-FIT session.",
      },
      { property: "og:title", content: "Settings — VISION-FIT®" },
      { property: "og:description", content: "Notification, security and account preferences." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const profileQuery = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: () => fetchProfile(user!.id),
    enabled: !!user,
  });

  const [emailReports, setEmailReports] = useState(true);
  const [weeklyReminders, setWeeklyReminders] = useState(true);

  useEffect(() => {
    const p = profileQuery.data;
    if (!p) return;
    setEmailReports(p.email_reports);
    setWeeklyReminders(p.weekly_reminders);
  }, [profileQuery.data]);

  const savePrefs = useMutation({
    mutationFn: async (next: { email_reports: boolean; weekly_reminders: boolean }) => {
      const { error } = await supabase
        .from("profiles")
        .update({ ...next, updated_at: new Date().toISOString() })
        .eq("id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Preferences saved");
      queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const resetPassword = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.resetPasswordForEmail(user!.email!, {
        redirectTo: `${window.location.origin}/auth`,
      });
      if (error) throw error;
    },
    onSuccess: () => toast.success("Password reset link sent to your email"),
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="animate-fade-rise space-y-5">
      <div>
        <p className="text-xs tracking-[0.3em] text-muted-foreground uppercase">Settings</p>
        <h1 className="font-display mt-3 text-4xl sm:text-5xl">Preferences</h1>
      </div>

      <section className="glass-card max-w-2xl space-y-6 p-8">
        <div className="flex items-center justify-between gap-6">
          <div>
            <Label htmlFor="emailReports">Email reports</Label>
            <p className="mt-1 text-sm text-muted-foreground">
              Receive each completed scan report by email.
            </p>
          </div>
          <Switch
            id="emailReports"
            checked={emailReports}
            onCheckedChange={(v) => {
              setEmailReports(v);
              savePrefs.mutate({ email_reports: v, weekly_reminders: weeklyReminders });
            }}
          />
        </div>
        <div className="flex items-center justify-between gap-6">
          <div>
            <Label htmlFor="weeklyReminders">Weekly reminders</Label>
            <p className="mt-1 text-sm text-muted-foreground">
              A nudge to run your weekly wellness scan.
            </p>
          </div>
          <Switch
            id="weeklyReminders"
            checked={weeklyReminders}
            onCheckedChange={(v) => {
              setWeeklyReminders(v);
              savePrefs.mutate({ email_reports: emailReports, weekly_reminders: v });
            }}
          />
        </div>
      </section>

      <section className="glass-card max-w-2xl space-y-5 p-8">
        <h2 className="font-display text-2xl">Account</h2>
        <p className="text-sm text-muted-foreground">Signed in as {user?.email}</p>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="ghost"
            className="glass rounded-full"
            disabled={resetPassword.isPending}
            onClick={() => resetPassword.mutate()}
          >
            Send password reset
          </Button>
          <Button
            variant="ghost"
            className="glass rounded-full"
            onClick={async () => {
              await signOut();
              navigate({ to: "/" });
            }}
          >
            Sign out
          </Button>
        </div>
      </section>
    </div>
  );
}
