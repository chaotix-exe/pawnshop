"use server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// Markeer inkopen als uitbetaald aan de medewerker (blijven in historie staan).
export async function markReimbursed(ids: number[]) {
  await requireAdmin();
  if (!ids?.length) return { ok: true };
  const { error } = await supabaseAdmin().from("transactions")
    .update({ uitbetaald: true, uitbetaald_op: new Date().toISOString() })
    .in("id", ids);
  if (error) throw new Error(error.message);
  revalidatePath("/");
  return { ok: true };
}
