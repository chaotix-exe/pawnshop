"use server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireUser } from "@/lib/auth";

export async function saveGameScore(score: number) {
  const me = await requireUser();
  const s = Math.max(0, Math.min(9999, Math.round(Number(score) || 0)));
  await supabaseAdmin().from("game_scores").insert({ username: me.username, naam: me.naam || me.username, score: s });
  return { ok: true };
}

export async function getLeaderboard() {
  const { data } = await supabaseAdmin().from("game_scores")
    .select("naam,username,score,created_at").order("score", { ascending: false }).limit(10);
  return (data as any) || [];
}
