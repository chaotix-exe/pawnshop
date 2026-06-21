"use server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function addAnnouncement(formData: FormData) {
  const me = await requireAdmin();
  const tekst = String(formData.get("tekst") || "").trim();
  if (!tekst) return;
  const pinned = formData.get("pinned") === "on";
  if (pinned) await supabaseAdmin().from("announcements").update({ pinned: false }).eq("pinned", true);
  await supabaseAdmin().from("announcements").insert({ tekst, pinned, author: me.naam || me.username });
  revalidatePath("/");
}

export async function deleteAnnouncement(formData: FormData) {
  await requireAdmin();
  await supabaseAdmin().from("announcements").delete().eq("id", Number(formData.get("id")));
  revalidatePath("/");
}
