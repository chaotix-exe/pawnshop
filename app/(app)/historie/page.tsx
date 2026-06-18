import { requireUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import Historie from "./Historie";

export const dynamic = "force-dynamic";

export default async function HistoriePage() {
  await requireUser();
  const { data } = await supabaseAdmin().from("transactions")
    .select("id,type,datum,medewerker,klant,item,aantal,prijs_ps,totaal,betaald,notitie")
    .order("datum", { ascending: false }).limit(5000);
  return <Historie rows={(data as any) || []} />;
}
