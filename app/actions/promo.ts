"use server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireUser, requireAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const BUCKET = "promo";

export async function listPromo() {
  const sb = supabaseAdmin();
  const { data: files } = await sb.storage.from(BUCKET).list("", { limit: 200, sortBy: { column: "created_at", order: "desc" } });
  const { data: meta } = await sb.from("promo_media").select("path,label,custom_url");
  const metaMap: Record<string, any> = {};
  (meta || []).forEach((m: any) => { metaMap[m.path] = m; });
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL + "/storage/v1/object/public/" + BUCKET + "/";
  return (files || [])
    .filter(f => f.name && f.name !== ".emptyFolderPlaceholder")
    .map(f => ({
      path: f.name,
      publicUrl: base + encodeURIComponent(f.name),
      customUrl: metaMap[f.name]?.custom_url || "",
      label: metaMap[f.name]?.label || "",
    }));
}

export async function uploadPromo(formData: FormData) {
  await requireUser();
  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) throw new Error("Geen bestand gekozen.");
  const ext = (file.name.split(".").pop() || "png").toLowerCase();
  const label = String(formData.get("label") || "").trim();
  const safe = (label || file.name.replace(/\.[^.]+$/, "")).replace(/[^a-z0-9-_]+/gi, "-").slice(0, 40) || "promo";
  const path = `${Date.now()}-${safe}.${ext}`;
  const buf = Buffer.from(await file.arrayBuffer());
  const { error } = await supabaseAdmin().storage.from(BUCKET).upload(path, buf, { contentType: file.type || "image/png", upsert: false });
  if (error) throw new Error(error.message);
  await supabaseAdmin().from("promo_media").insert({ path, label: label || null });
  revalidatePath("/promo");
}

export async function setPromoLink(formData: FormData) {
  await requireAdmin();
  const path = String(formData.get("path") || "");
  const custom_url = String(formData.get("custom_url") || "").trim() || null;
  const label = String(formData.get("label") || "").trim() || null;
  if (!path) return;
  await supabaseAdmin().from("promo_media").upsert({ path, custom_url, label });
  revalidatePath("/promo");
}

export async function deletePromo(formData: FormData) {
  await requireAdmin();
  const path = String(formData.get("path") || "");
  if (path) { await supabaseAdmin().storage.from(BUCKET).remove([path]); await supabaseAdmin().from("promo_media").delete().eq("path", path); }
  revalidatePath("/promo");
}
