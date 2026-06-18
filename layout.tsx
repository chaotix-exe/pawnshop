import { requireAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import AdminClient from "./AdminClient";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  await requireAdmin();
  const sb = supabaseAdmin();
  const { data: items } = await sb.from("items").select("*").order("categorie").order("item");
  const { data: recipes } = await sb.from("recipes").select("id,station,product,recipe_ingredients(id,ingredient,aantal,eenheid)").order("product");
  const { data: users } = await sb.from("profiles").select("id,username,naam,rol").order("username");
  return <AdminClient items={(items as any) || []} recipes={(recipes as any) || []} users={(users as any) || []} />;
}
