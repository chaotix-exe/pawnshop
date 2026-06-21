import { requireUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import DashCharts from "./DashCharts";
import Board from "./Board";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const me = await requireUser();
  const sb = supabaseAdmin();
  const { data: announcements } = await sb.from("announcements").select("*").order("pinned", { ascending: false }).order("created_at", { ascending: false }).limit(20);
  const { data: tx } = await sb.from("transactions").select("type,totaal,item,aantal,datum,klant,medewerker").order("datum", { ascending: false });
  const { data: items } = await sb.from("items").select("item,categorie");
  const { count: openTodos } = await sb.from("craft_todos").select("*", { count: "exact", head: true }).eq("klaar", false);

  const cat: Record<string, string> = {};
  (items || []).forEach((i: any) => { cat[String(i.item).toLowerCase()] = i.categorie; });

  let ink = 0, ver = 0, ni = 0, nv = 0;
  const perDay: Record<string, { v: number; i: number }> = {};
  const perItem: Record<string, number> = {};
  const perCat: Record<string, number> = {};
  (tx || []).forEach((t: any) => {
    const tot = Number(t.totaal) || 0;
    const d = new Date(t.datum); const key = d.toISOString().slice(0, 10);
    perDay[key] = perDay[key] || { v: 0, i: 0 };
    if (t.type === "Inkoop") { ink += tot; ni++; perDay[key].i += tot; }
    else {
      ver += tot; nv++; perDay[key].v += tot;
      perItem[t.item] = (perItem[t.item] || 0) + (Number(t.aantal) || 0);
      const c = cat[String(t.item).toLowerCase()] || "Overig";
      perCat[c] = (perCat[c] || 0) + tot;
    }
  });

  const timeline = Object.keys(perDay).sort().map(k => ({
    datum: new Date(k).toLocaleDateString("nl-NL", { day: "2-digit", month: "2-digit" }),
    Verkoop: Math.round(perDay[k].v), Inkoop: Math.round(perDay[k].i), Marge: Math.round(perDay[k].v - perDay[k].i),
  }));
  const topItems = Object.entries(perItem).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, aantal]) => ({ name, aantal }));
  const catData = Object.entries(perCat).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value: Math.round(value) }));

  const eur = (n: number) => "€" + Math.round(n).toLocaleString("nl-NL");
  const Stat = ({ l, v, c, sub }: any) => (
    <div className="panel lift" style={{ margin: 0, padding: 18 }}>
      <div style={{ color: "var(--muted)", fontSize: 11, textTransform: "uppercase", letterSpacing: .5, fontWeight: 600 }}>{l}</div>
      <div className="display" style={{ fontSize: 30, color: c, marginTop: 4 }}>{v}</div>
      {sub && <div style={{ color: "var(--muted)", fontSize: 12 }}>{sub}</div>}
    </div>
  );

  return (
    <div>
      <h2 className="page">Dashboard</h2>
      <Board items={(announcements as any) || []} isAdmin={me.rol === "admin"} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12, marginBottom: 14 }}>
        <Stat l="Verkocht" v={eur(ver)} c="var(--green)" sub={nv + " transacties"} />
        <Stat l="Ingekocht" v={eur(ink)} c="var(--red)" sub={ni + " transacties"} />
        <Stat l="Bruto marge" v={eur(ver - ink)} c={(ver - ink) >= 0 ? "var(--gold)" : "var(--red)"} />
        <Stat l="Open to-do's" v={String(openTodos ?? 0)} c="var(--cream)" sub="craftlijst" />
      </div>
      <DashCharts timeline={timeline} topItems={topItems} catData={catData} hasData={(tx || []).length > 0} />
    </div>
  );
}
