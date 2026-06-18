"use client";
import { useMemo, useState } from "react";

type Row = { id: number; type: string; datum: string; medewerker: string | null; klant: string | null; item: string; aantal: number; prijs_ps: number; totaal: number; betaald: boolean; notitie: string | null };
const eur = (n: number) => "€" + Math.round(n || 0).toLocaleString("nl-NL");
const dt = (s: string) => new Date(s).toLocaleDateString("nl-NL");

export default function Historie({ rows }: { rows: Row[] }) {
  const [type, setType] = useState("alles");
  const [van, setVan] = useState(""); const [tot, setTot] = useState("");
  const [persoon, setPersoon] = useState(""); const [min, setMin] = useState(""); const [max, setMax] = useState("");
  const [busy, setBusy] = useState(false);

  const filtered = useMemo(() => rows.filter(r => {
    if (type !== "alles" && r.type !== type) return false;
    if (van && new Date(r.datum) < new Date(van)) return false;
    if (tot && new Date(r.datum) > new Date(tot + "T23:59:59")) return false;
    if (persoon) {
      const p = persoon.toLowerCase();
      if (!(`${r.medewerker || ""} ${r.klant || ""}`.toLowerCase().includes(p))) return false;
    }
    const t = Number(r.totaal) || 0;
    if (min && t < Number(min)) return false;
    if (max && t > Number(max)) return false;
    return true;
  }), [rows, type, van, tot, persoon, min, max]);

  const tot_ver = filtered.filter(r => r.type === "Verkoop").reduce((a, r) => a + (Number(r.totaal) || 0), 0);
  const tot_ink = filtered.filter(r => r.type === "Inkoop").reduce((a, r) => a + (Number(r.totaal) || 0), 0);

  function reset() { setType("alles"); setVan(""); setTot(""); setPersoon(""); setMin(""); setMax(""); }

  async function downloadPdf() {
    setBusy(true);
    try {
      const jsPDFmod: any = await import("jspdf");
      const jsPDF = jsPDFmod.jsPDF || jsPDFmod.default;
      const autoTable = (await import("jspdf-autotable")).default;
      const doc = new jsPDF({ orientation: "landscape" });
      // logo
      try {
        const res = await fetch("/images/banner.jpg"); const blob = await res.blob();
        const b64: string = await new Promise(r => { const fr = new FileReader(); fr.onload = () => r(fr.result as string); fr.readAsDataURL(blob); });
        doc.addImage(b64, "JPEG", 14, 10, 38, 12);
      } catch {}
      doc.setFontSize(16); doc.setTextColor(40); doc.text("Transactiehistorie — Miko's Pawn Shop", 58, 18);
      doc.setFontSize(9); doc.setTextColor(120);
      const f: string[] = [];
      if (type !== "alles") f.push("Type: " + type);
      if (van) f.push("Vanaf: " + dt(van));
      if (tot) f.push("Tot: " + dt(tot));
      if (persoon) f.push("Persoon: " + persoon);
      if (min) f.push("Min: " + eur(Number(min)));
      if (max) f.push("Max: " + eur(Number(max)));
      doc.text((f.length ? f.join("  ·  ") : "Alle transacties") + "   |   Gegenereerd: " + new Date().toLocaleString("nl-NL"), 58, 24);

      autoTable(doc, {
        startY: 30,
        head: [["Datum", "Type", "Item", "Aantal", "Prijs p.s.", "Totaal", "Klant", "Medewerker", "Betaald"]],
        body: filtered.map(r => [dt(r.datum), r.type, r.item, String(r.aantal), eur(r.prijs_ps), eur(r.totaal), r.klant || "-", r.medewerker || "-", r.betaald ? "Ja" : "Nee"]),
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [46, 125, 50] },
        alternateRowStyles: { fillColor: [240, 245, 240] },
      });
      const y = (doc as any).lastAutoTable.finalY + 8;
      doc.setFontSize(10); doc.setTextColor(40);
      doc.text(`Totaal verkocht: ${eur(tot_ver)}    Totaal ingekocht: ${eur(tot_ink)}    Bruto marge: ${eur(tot_ver - tot_ink)}    (${filtered.length} regels)`, 14, y);
      doc.save(`transactiehistorie-${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (e: any) { alert("PDF maken mislukt: " + e.message); }
    setBusy(false);
  }

  return (
    <div>
      <h2 className="page">Transactiehistorie</h2>
      <div className="panel">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12 }}>
          <div><label>Type</label><select value={type} onChange={e => setType(e.target.value)}><option value="alles">Alles</option><option>Verkoop</option><option>Inkoop</option></select></div>
          <div><label>Datum vanaf</label><input type="date" value={van} onChange={e => setVan(e.target.value)} /></div>
          <div><label>Datum tot</label><input type="date" value={tot} onChange={e => setTot(e.target.value)} /></div>
          <div><label>Persoon (klant/medewerker)</label><input value={persoon} onChange={e => setPersoon(e.target.value)} placeholder="naam" /></div>
          <div><label>Bedrag min</label><input type="number" value={min} onChange={e => setMin(e.target.value)} /></div>
          <div><label>Bedrag max</label><input type="number" value={max} onChange={e => setMax(e.target.value)} /></div>
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap", alignItems: "center" }}>
          <button className="btn" onClick={downloadPdf} disabled={busy || !filtered.length}>{busy ? "Bezig…" : "⬇ Download PDF"}</button>
          <button className="btn ghost sm" onClick={reset}>Filters wissen</button>
          <span className="muted" style={{ marginLeft: "auto", fontSize: 13 }}>
            {filtered.length} regels · <span className="green">verkoop {eur(tot_ver)}</span> · <span className="red">inkoop {eur(tot_ink)}</span> · <span className="gold">marge {eur(tot_ver - tot_ink)}</span>
          </span>
        </div>
      </div>
      <div className="panel" style={{ overflowX: "auto" }}>
        <table>
          <thead><tr><th>Datum</th><th>Type</th><th>Item</th><th className="r">Aantal</th><th className="r">Prijs p.s.</th><th className="r">Totaal</th><th>Klant</th><th>Medewerker</th><th>Betaald</th></tr></thead>
          <tbody>
            {filtered.length === 0 ? <tr><td colSpan={9} className="muted">Geen transacties met deze filters.</td></tr> :
              filtered.map(r => (
                <tr key={r.id}>
                  <td className="muted">{dt(r.datum)}</td>
                  <td style={{ color: r.type === "Verkoop" ? "var(--green)" : "var(--red)", fontWeight: 700 }}>{r.type}</td>
                  <td>{r.item}</td><td className="r">{r.aantal}</td><td className="r">{eur(r.prijs_ps)}</td>
                  <td className="r"><b>{eur(r.totaal)}</b></td><td className="muted">{r.klant || "—"}</td><td className="muted">{r.medewerker || "—"}</td>
                  <td>{r.betaald ? "✓" : "—"}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
