"use client";
import { useMemo, useState } from "react";
import { recordTransaction } from "@/app/actions/data";

type Item = { categorie: string; item: string; aankoopprijs: number | null; verkoopprijs: number | null; opmerking: string | null };
type Line = { item: string; aantal: number; prijs_ps: number };
const eur = (n: number) => "€" + Math.round(n || 0).toLocaleString("nl-NL");

export default function Kassa({ items }: { items: Item[] }) {
  const [mode, setMode] = useState<"Verkoop" | "Inkoop">("Verkoop");
  const [sel, setSel] = useState(items[0]?.item || "");
  const [qty, setQty] = useState(1);
  const [price, setPrice] = useState<number | "">("");
  const [lines, setLines] = useState<Line[]>([]);
  const [klant, setKlant] = useState("");
  const [paid, setPaid] = useState(true);
  const [note, setNote] = useState("");
  const [msg, setMsg] = useState<{ t: string; err?: boolean } | null>(null);
  const [busy, setBusy] = useState(false);

  const byName = useMemo(() => Object.fromEntries(items.map(i => [i.item, i])), [items]);
  const cats = useMemo(() => {
    const m: Record<string, Item[]> = {};
    items.forEach(i => { (m[i.categorie] = m[i.categorie] || []).push(i); });
    return m;
  }, [items]);

  function pick(name: string) {
    setSel(name);
    const it = byName[name];
    const p = mode === "Verkoop" ? it?.verkoopprijs : it?.aankoopprijs;
    setPrice(p == null ? "" : p);
  }
  function switchMode(m: "Verkoop" | "Inkoop") {
    setMode(m);
    const it = byName[sel];
    const p = m === "Verkoop" ? it?.verkoopprijs : it?.aankoopprijs;
    setPrice(p == null ? "" : p);
  }
  function addLine() {
    if (!sel || qty <= 0 || price === "") { setMsg({ t: "Kies item, aantal en prijs", err: true }); return; }
    setLines([...lines, { item: sel, aantal: qty, prijs_ps: Number(price) }]);
  }
  const total = lines.reduce((a, l) => a + l.aantal * l.prijs_ps, 0);

  async function submit() {
    if (!lines.length) { setMsg({ t: "Voeg eerst items toe", err: true }); return; }
    if (mode === "Inkoop" && !klant.trim()) { setMsg({ t: "Klantnaam verplicht bij inkoop", err: true }); return; }
    setBusy(true);
    try {
      const r = await recordTransaction({ type: mode, klant, betaald: paid, notitie: note, lines });
      setMsg({ t: `${mode} geregistreerd (${r.count} regel${r.count > 1 ? "s" : ""})` });
      setLines([]); setNote(""); setKlant("");
    } catch (e: any) { setMsg({ t: "Fout: " + e.message, err: true }); }
    setBusy(false);
  }
  const it = byName[sel];
  const other = it ? (mode === "Verkoop" ? it.aankoopprijs : it.verkoopprijs) : null;

  return (
    <div className="panel">
      <div style={{ display: "flex", borderRadius: 10, overflow: "hidden", border: "1px solid #2c3327", marginBottom: 8 }}>
        <button onClick={() => switchMode("Verkoop")} style={{ flex: 1, padding: 12, border: 0, fontWeight: 800, cursor: "pointer", background: mode === "Verkoop" ? "#2E7D32" : "#20261d", color: mode === "Verkoop" ? "#fff" : "#9aa593" }}>VERKOOP</button>
        <button onClick={() => switchMode("Inkoop")} style={{ flex: 1, padding: 12, border: 0, fontWeight: 800, cursor: "pointer", background: mode === "Inkoop" ? "#C62828" : "#20261d", color: mode === "Inkoop" ? "#fff" : "#9aa593" }}>INKOOP</button>
      </div>
      {mode === "Inkoop" && (<><label>Klant (verplicht)</label><input value={klant} onChange={e => setKlant(e.target.value)} /></>)}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
        <div style={{ flex: 2, minWidth: 160 }}><label>Item</label>
          <select value={sel} onChange={e => pick(e.target.value)}>
            {Object.entries(cats).sort((a, b) => a[0] === "Diversen" ? 1 : b[0] === "Diversen" ? -1 : a[0].localeCompare(b[0])).map(([c, list]) => <optgroup key={c} label={c}>{list.map(i => <option key={i.item} value={i.item}>{i.item}</option>)}</optgroup>)}
          </select>
        </div>
        <div style={{ width: 80 }}><label>Aantal</label><input type="number" min={1} value={qty} onChange={e => setQty(Number(e.target.value))} /></div>
        <div style={{ width: 110 }}><label>Prijs p.s.</label><input type="number" value={price} onChange={e => setPrice(e.target.value === "" ? "" : Number(e.target.value))} /></div>
        <button className="btn sm" onClick={addLine}>+ Toevoegen</button>
      </div>
      <p style={{ color: "#9aa593", fontSize: 12 }}>{price === "" ? "⚠ Geen richtprijs — vul handmatig in. " : "Richtprijs. "}{other != null ? `Andere kant: ${eur(other)}. ` : ""}{it?.opmerking || ""}</p>
      {lines.length > 0 && (
        <table><thead><tr><th>Item</th><th className="r">Aantal</th><th className="r">Prijs</th><th className="r">Totaal</th><th /></tr></thead>
          <tbody>{lines.map((l, i) => <tr key={i}><td>{l.item}</td><td className="r">{l.aantal}</td><td className="r">{eur(l.prijs_ps)}</td><td className="r">{eur(l.aantal * l.prijs_ps)}</td>
            <td className="r"><span style={{ color: "#e23b3b", cursor: "pointer" }} onClick={() => setLines(lines.filter((_, j) => j !== i))}>✕</span></td></tr>)}</tbody>
        </table>
      )}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14 }}>
        <div><span style={{ color: "#9aa593" }}>Totaal</span><div style={{ fontSize: 26, fontWeight: 900, color: "#3ddc4a" }}>{eur(total)}</div></div>
        <label style={{ display: "flex", alignItems: "center", gap: 8, textTransform: "none", color: "#f3f0e6" }}><input type="checkbox" style={{ width: "auto" }} checked={paid} onChange={e => setPaid(e.target.checked)} /> Betaald?</label>
      </div>
      <label>Notitie</label><input value={note} onChange={e => setNote(e.target.value)} />
      {msg && <p style={{ color: msg.err ? "#e23b3b" : "#3ddc4a", fontSize: 14 }}>{msg.t}</p>}
      <div style={{ marginTop: 12 }}><button className={"btn" + (mode === "Inkoop" ? " red" : "")} style={{ width: "100%", color: "#fff" }} disabled={busy} onClick={submit}>{busy ? "Bezig…" : `REGISTREER ${mode.toUpperCase()}`}</button></div>
    </div>
  );
}
