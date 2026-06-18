import { requireUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  await requireUser();
  const sb = supabaseAdmin();
  const { data: tx } = await sb.from("transactions").select("type, totaal");
  let ink = 0, ver = 0, ni = 0, nv = 0;
  (tx || []).forEach((t: any) => {
    if (t.type === "Inkoop") { ink += Number(t.totaal) || 0; ni++; }
    else { ver += Number(t.totaal) || 0; nv++; }
  });
  const eur = (n: number) => "€" + Math.round(n).toLocaleString("nl-NL");
  const stat = (l: string, v: string, c: string) => (
    <div className="panel" style={{ margin: 0 }}><div style={{ color: "#9aa593", fontSize: 12, textTransform: "uppercase" }}>{l}</div><div style={{ fontSize: 24, fontWeight: 900, color: c }}>{v}</div></div>
  );
  return (
    <div>
      <h2 style={{ color: "#3ddc4a" }}>Dashboard</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 10 }}>
        {stat("Ingekocht", eur(ink), "#e23b3b")}
        {stat("Verkocht", eur(ver), "#3ddc4a")}
        {stat("Bruto marge", eur(ver - ink), (ver - ink) >= 0 ? "#f0c43c" : "#e23b3b")}
        {stat("Inkooptransacties", String(ni), "#f3f0e6")}
        {stat("Verkooptransacties", String(nv), "#f3f0e6")}
      </div>
    </div>
  );
}
