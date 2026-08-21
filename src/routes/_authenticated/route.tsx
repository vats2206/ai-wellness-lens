import { createFileRoute, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { AppNav } from "@/components/AppNav";

export const Route = createFileRoute("/_authenticated")({ component: AuthenticatedLayout });

function AuthenticatedLayout() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const destination = useRef<string | null>(null);
  if (pathname !== "/auth" && pathname !== "/" && !destination.current) destination.current = pathname;

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/auth", search: { redirect: destination.current ?? "/dashboard" }, replace: true });
    }
  }, [loading, user, navigate]);

  if (loading || !user) return <div className="flex min-h-screen items-center justify-center bg-background"><div className="skeleton-glass h-24 w-64 rounded-3xl" /></div>;
  return <div className="min-h-screen bg-background"><AppNav /><main className="mx-auto max-w-6xl px-5 pt-28 pb-24 sm:px-6"><Outlet /></main></div>;
}