import { requireUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import Craft from "./Craft";

export const dynamic = "force-dynamic";

export default async function CraftPage() {
  await requireUser();
  const sb = supabaseAdmin();
  const { data: recipes } = await sb.from("recipes").select("id,station,product,tijd,recipe_ingredients(ingredient,aantal,eenheid,opmerking)").order("product");
  const { data: items } = await sb.from("items").select("item,aankoopprijs");
  const prices: Record<string, number> = {};
  (items || []).forEach((i: any) => { if (i.aankoopprijs != null) prices[String(i.item).toLowerCase()] = Number(i.aankoopprijs); });
  return <Craft recipes={(recipes as any) || []} prices={prices} />;
}
