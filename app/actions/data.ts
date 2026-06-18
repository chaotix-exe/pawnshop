"use server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireUser, requireAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";

/* ---------- transacties ---------- */
export async function recordTransaction(payload: {
  type: "Inkoop" | "Verkoop"; klant?: string; betaald: boolean; notitie?: string;
  lines: { item: string; aantal: number; prijs_ps: number }[];
}) {
  const me = await requireUser();
  const rows = payload.lines.filter(l => l.item).map(l => ({
    type: payload.type, medewerker: me.naam || me.username, klant: payload.klant || null,
    item: l.item, aantal: Number(l.aantal) || 0, prijs_ps: Number(l.prijs_ps) || 0,
    betaald: payload.betaald, notitie: payload.notitie || null,
  }));
  if (!rows.length) throw new Error("Geen regels.");
  const { error } = await supabaseAdmin().from("transactions").insert(rows);
  if (error) throw new Error(error.message);
  revalidatePath("/"); return { ok: true, count: rows.length };
}

/* ---------- craft to-do ---------- */
export async function addTodo(payload: { item: string; aantal?: number; voor?: string; notitie?: string }) {
  const me = await requireUser();
  if (!payload.item) throw new Error("Item verplicht.");
  const { error } = await supabaseAdmin().from("craft_todos").insert({
    item: payload.item, aantal: payload.aantal || null, voor: payload.voor || null,
    toegevoegd_door: me.naam || me.username, notitie: payload.notitie || null,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/todo"); return { ok: true };
}
export async function completeTodo(id: number) {
  await requireUser();
  await supabaseAdmin().from("craft_todos").update({ klaar: true }).eq("id", id);
  revalidatePath("/todo"); return { ok: true };
}

/* ---------- admin: items ---------- */
export async function saveItem(_prev: any, formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") ? Number(formData.get("id")) : null;
  const n = (k: string) => { const v = formData.get(k); return v === "" || v === null ? null : Number(v); };
  const rec = {
    categorie: String(formData.get("categorie") || ""), item: String(formData.get("item") || ""),
    aankoopprijs: n("aankoopprijs"), verkoopprijs: n("verkoopprijs"), craftkost: n("craftkost"),
    opmerking: String(formData.get("opmerking") || "") || null,
  };
  const sb = supabaseAdmin();
  const { error } = id ? await sb.from("items").update(rec).eq("id", id) : await sb.from("items").insert(rec);
  if (error) return { error: error.message };
  revalidatePath("/admin"); return { ok: true };
}
export async function deleteItem(formData: FormData) {
  await requireAdmin();
  await supabaseAdmin().from("items").delete().eq("id", Number(formData.get("id")));
  revalidatePath("/admin");
}

/* ---------- admin: recept-ingredient bijwerken ---------- */
export async function saveIngredient(_prev: any, formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const { error } = await supabaseAdmin().from("recipe_ingredients")
    .update({ aantal: Number(formData.get("aantal")) || 0, eenheid: String(formData.get("eenheid") || "x") })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin"); return { ok: true };
}
