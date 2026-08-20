import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Scan = Tables<"scans">;
export type Profile = Tables<"profiles">;

export type Metric = { label: string; score: number; note: string };
export type Recommendation = { title: string; detail: string; category: string };

export function metricsOf(scan: Scan): Metric[] {
  return Array.isArray(scan.metrics) ? (scan.metrics as unknown as Metric[]) : [];
}

export function recommendationsOf(scan: Scan): Recommendation[] {
  return Array.isArray(scan.recommendations)
    ? (scan.recommendations as unknown as Recommendation[])
    : [];
}

export async function fetchScans(): Promise<Scan[]> {
  const { data, error } = await supabase
    .from("scans")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function fetchScan(id: string): Promise<Scan> {
  const { data, error } = await supabase.from("scans").select("*").eq("id", id).single();
  if (error) throw error;
  return data;
}

export async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  if (data) return data;
  const { data: created, error: insertError } = await supabase
    .from("profiles")
    .insert({ id: userId })
    .select("*")
    .single();
  if (insertError) throw insertError;
  return created;
}

export async function signedImageUrl(path: string | null): Promise<string | null> {
  if (!path) return null;
  const { data, error } = await supabase.storage.from("scans").createSignedUrl(path, 3600);
  if (error) return null;
  return data.signedUrl;
}

export function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
