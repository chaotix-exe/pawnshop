import { supabaseServer } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";

export type Profile = { id: string; username: string; naam: string | null; rol: "admin" | "medewerker" };

// Huidige ingelogde gebruiker + profiel (of null).
export async function getProfile(): Promise<Profile | null> {
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return null;
  const { data } = await supabaseAdmin().from("profiles").select("*").eq("id", user.id).single();
  return (data as Profile) ?? null;
}

export async function requireUser(): Promise<Profile> {
  const p = await getProfile();
  if (!p) redirect("/login");
  return p;
}

export async function requireAdmin(): Promise<Profile> {
  const p = await requireUser();
  if (p.rol !== "admin") redirect("/");
  return p;
}

export function usernameToEmail(username: string) {
  const domain = process.env.USERNAME_EMAIL_DOMAIN || "miko.local";
  return `${username.trim().toLowerCase()}@${domain}`;
}
