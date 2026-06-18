import { requireUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import Kassa from "./Kassa";

export const dynamic = "force-dynamic";

export default async function KassaPage() {
  await requireUser();
  const { data } = await supabaseAdmin().from("items").select("categorie,item,aankoopprijs,verkoopprijs,opmerking").order("categorie");
  return <Kassa items={(data as any) || []} />;
}
