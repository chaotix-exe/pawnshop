import { requireUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const me = await requireUser();
  const sb = supabaseAdmin();
  const { data: tx } = await sb.from("transactions").select("type, totaal, item, datum, klant, medewerker").order("datum", { ascending: false });
  const { count: openTodos } = await sb.from("craft_todos").select("*", { count: "exact", head: true }).eq("klaar", false);
  let ink = 0, ver = 0, ni = 0, nv = 0;
  (tx || []).forEach((t: any) => {
    if (t.type === "Inkoop") { ink += Number(t.totaal) || 0; ni++; }
    else { ver += Number(t.totaal) || 0; nv++; }
  });
  const eur = (n: number) => "€" + Math.round(n).toLocaleString("nl-NL");
  const recent = (tx || []).slice(0, 8);

  const Stat = ({ l, v, c, sub }: any) => (
    <div className="panel" style={{ margin: 0, padding: 16 }}>
      <div style={{ color: "var(--muted)", fontSize: 11, textTransform: "uppercase", letterSpacing: .5, fontWeight: 600 }}>{l}</div>
      <div className="display" style={{ fontSize: 30, color: c, marginTop: 4 }}>{v}</div>
      {sub && <div style={{ color: "var(--muted)", fontSize: 12 }}>{sub}</div>}
    </div>
  );

  return (
    <div>
      <h2 style={{ fontSize: 24, margin: "2px 0 14px" }}>Dashboard</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12, marginBottom: 4 }}>
        <Stat l="Verkocht" v={eur(ver)} c="var(--green)" sub={nv + " transacties"} />
        <Stat l="Ingekocht" v={eur(ink)} c="var(--red)" sub={ni + " transacties"} />
        <Stat l="Bruto marge" v={eur(ver - ink)} c={(ver - ink) >= 0 ? "var(--gold)" : "var(--red)"} />
        <Stat l="Open to-do's" v={String(openTodos ?? 0)} c="var(--cream)" sub="craftlijst" />
      </div>
      <div className="panel">
        <h3 style={{ fontSize: 15, color: "var(--gold)", margin: "0 0 8px" }}>Recente transacties</h3>
        {recent.length === 0 ? <p className="muted" style={{ margin: 0 }}>Nog geen transacties — registreer je eerste in de Kassa.</p> : (
          <table>
            <thead><tr><th>Datum</th><th>Type</th><th>Item</th><th>Klant</th><th>Door</th><th className="r">Totaal</th></tr></thead>
            <tbody>{recent.map((t: any, i: number) => (
              <tr key={i}>
                <td className="muted">{new Date(t.datum).toLocaleDateString("nl-NL")}</td>
                <td><span style={{ color: t.type === "Verkoop" ? "var(--green)" : "var(--red)", fontWeight: 700 }}>{t.type}</span></td>
                <td>{t.item}</td><td className="muted">{t.klant || "—"}</td><td className="muted">{t.medewerker || "—"}</td>
                <td className="r">{eur(Number(t.totaal) || 0)}</td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </div>
    </div>
  );
}
