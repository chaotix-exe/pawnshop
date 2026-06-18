"use server";
import { supabaseServer } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { usernameToEmail, requireAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function login(_prev: any, formData: FormData) {
  const username = String(formData.get("username") || "");
  const password = String(formData.get("password") || "");
  const sb = supabaseServer();
  const { error } = await sb.auth.signInWithPassword({ email: usernameToEmail(username), password });
  if (error) return { error: "Onjuiste gebruikersnaam of wachtwoord." };
  redirect("/");
}

export async function logout() {
  await supabaseServer().auth.signOut();
  redirect("/login");
}

// Eerste admin aanmaken — werkt alleen zolang er nog GEEN profielen bestaan.
export async function setupFirstAdmin(_prev: any, formData: FormData) {
  const admin = supabaseAdmin();
  const { count } = await admin.from("profiles").select("*", { count: "exact", head: true });
  if ((count ?? 0) > 0) return { error: "Er bestaat al een gebruiker. Setup is afgesloten." };

  const username = String(formData.get("username") || "").trim().toLowerCase();
  const naam = String(formData.get("naam") || "");
  const password = String(formData.get("password") || "");
  if (!username || password.length < 6) return { error: "Vul een gebruikersnaam en wachtwoord (min. 6 tekens) in." };

  const { data: created, error } = await admin.auth.admin.createUser({
    email: usernameToEmail(username), password, email_confirm: true,
  });
  if (error || !created.user) return { error: "Kon gebruiker niet aanmaken: " + (error?.message || "") };
  await admin.from("profiles").insert({ id: created.user.id, username, naam, rol: "admin" });
  redirect("/login");
}

// Admin-only: nieuwe medewerker
export async function createEmployee(_prev: any, formData: FormData) {
  await requireAdmin();
  const admin = supabaseAdmin();
  const username = String(formData.get("username") || "").trim().toLowerCase();
  const naam = String(formData.get("naam") || "");
  const rol = String(formData.get("rol") || "medewerker") as "admin" | "medewerker";
  const password = String(formData.get("password") || "");
  if (!username || password.length < 6) return { error: "Gebruikersnaam + wachtwoord (min. 6 tekens) verplicht." };
  const { data: created, error } = await admin.auth.admin.createUser({
    email: usernameToEmail(username), password, email_confirm: true,
  });
  if (error || !created.user) return { error: "Aanmaken mislukt: " + (error?.message || "") };
  await admin.from("profiles").insert({ id: created.user.id, username, naam, rol });
  revalidatePath("/admin");
  return { ok: true };
}

export async function resetPassword(_prev: any, formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const password = String(formData.get("password") || "");
  if (password.length < 6) return { error: "Wachtwoord min. 6 tekens." };
  const { error } = await supabaseAdmin().auth.admin.updateUserById(id, { password });
  if (error) return { error: error.message };
  return { ok: true };
}

export async function deleteEmployee(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  await supabaseAdmin().auth.admin.deleteUser(id);
  revalidatePath("/admin");
}
