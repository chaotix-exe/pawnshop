"use server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const BUCKET = "promo";

export async function listPromo() {
  const { data } = await supabaseAdmin().storage.from(BUCKET).list("", {
    limit: 200, sortBy: { column: "created_at", order: "desc" },
  });
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL + "/storage/v1/object/public/" + BUCKET + "/";
  return (data || [])
    .filter(f => f.name && f.name !== ".emptyFolderPlaceholder")
    .map(f => ({ name: f.name, url: base + encodeURIComponent(f.name) }));
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
  revalidatePath("/promo");
}

export async function deletePromo(formData: FormData) {
  await requireUser();
  const name = String(formData.get("name") || "");
  if (name) await supabaseAdmin().storage.from(BUCKET).remove([name]);
  revalidatePath("/promo");
}
