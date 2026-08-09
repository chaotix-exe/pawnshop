"use client";
import { useMemo, useState } from "react";
import { recordTransaction } from "@/app/actions/data";

type Item = { categorie: string; item: string; aankoopprijs: number | null; verkoopprijs: number | null; opmerking: string | null };
type Line = { item: string; aantal: number; prijs_ps: number };
const eur = (n: number) => "€" + Math.round(n || 0).toLocaleString("nl-NL");

export default function Kassa({ items }: { items: Item[] }) {
  return (
    <div>
      <h2 className="page">Kassa</h2>
      <div className="kassa-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Column mode="Verkoop" items={items} />
        <Column mode="Inkoop" items={items} />
      </div>
      <style>{`@media(max-width:900px){.kassa-grid{grid-template-columns:1fr !important}}`}</style>
    </div>
  );
}

function Column({ mode, items }: { mode: "Verkoop" | "Inkoop"; items: Item[] }) {
  const isSell = mode === "Verkoop";
  const accent = isSell ? "var(--green)" : "var(--red)";
  const [q, setQ] = useState("");
  const [lines, setLines] = useState<Line[]>([]);
  const [klant, setKlant] = useState("");
  const [paid, setPaid] = useState(true);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ t: string; err?: boolean } | null>(null);

  const priceOf = (it: Item) => (isSell ? it.verkoopprijs : it.aankoopprijs);

  // normaliseer: kleine letters, accenten weg, alle niet-letters/cijfers weg
  const norm = (s: string) => (s || "").toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ").trim();

  const results = useMemo(() => {
    const terms = norm(q).split(" ").filter(Boolean);
    const scored = items.map(it => {
      const name = norm(it.item);
      const cat = norm(it.categorie);
      const hay = name + " " + cat;
      if (terms.length === 0) return { it, score: 0 };
      // elk woord moet ergens voorkomen (zo werkt "gouden dol" ook)
      if (!terms.every(t => hay.includes(t))) return null;
      const first = terms[0];
      let score = 4;
      if (name === norm(q)) score = 0;                  // exacte naam
      else if (name.startsWith(first)) score = 1;        // begint ermee
      else if (name.split(" ").some(w => w.startsWith(first))) score = 2; // woord begint ermee
      else if (name.includes(first)) score = 3;          // ergens in naam
      return { it, score };                              // anders: alleen categorie
    }).filter(Boolean) as { it: Item; score: number }[];

    scored.sort((a, b) =>
      a.score - b.score ||
      a.it.categorie.localeCompare(b.it.categorie) ||
      a.it.item.localeCompare(b.it.item)
    );
    return scored.map(s => s.it);
  }, [q, items]);

  function add(it: Item) {
    setLines(prev => {
      const i = prev.findIndex(l => l.item === it.item);
      if (i >= 0) { const c = [...prev]; c[i] = { ...c[i], aantal: c[i].aantal + 1 }; return c; }
      return [...prev, { item: it.item, aantal: 1, prijs_ps: priceOf(it) ?? 0 }];
    });
  }
  function setQty(i: number, d: number) { setLines(p => p.map((l, j) => j === i ? { ...l, aantal: Math.max(1, l.aantal + d) } : l)); }
  function setPrice(i: number, v: number) { setLines(p => p.map((l, j) => j === i ? { ...l, prijs_ps: v } : l)); }
  function del(i: number) { setLines(p => p.filter((_, j) => j !== i)); }
  const total = lines.reduce((a, l) => a + l.aantal * l.prijs_ps, 0);

  async function submit() {
    if (!lines.length) { setMsg({ t: "Voeg eerst items toe", err: true }); return; }
    if (!isSell && !klant.trim()) { setMsg({ t: "Klantnaam verplicht bij inkoop", err: true }); return; }
    setBusy(true);
    try {
      const r = await recordTransaction({ type: mode, klant, betaald: paid, notitie: note, lines });
      setMsg({ t: `${mode} geregistreerd (${r.count})` });
      setLines([]); setNote(""); setKlant(""); setQ("");
    } catch (e: any) { setMsg({ t: "Fout: " + e.message, err: true }); }
    setBusy(false);
  }

  return (
    <div className="panel" style={{ borderColor: accent, display: "flex", flexDirection: "column", minHeight: 520 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <span style={{ width: 12, height: 12, borderRadius: 3, background: accent }} />
        <h3 className="display" style={{ fontSize: 20, margin: 0, color: accent }}>{isSell ? "VERKOOP" : "INKOOP"}</h3>
        <span className="muted" style={{ fontSize: 12, marginLeft: "auto" }}>{isSell ? "aan de klant" : "van de klant"}</span>
      </div>

      <div style={{ position: "relative" }}>
        <input placeholder="🔍 Zoek item… (Enter = eerste toevoegen)" value={q}
          onChange={e => setQ(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && results[0]) { add(results[0]); setQ(""); } if (e.key === "Escape") setQ(""); }} />
        {q && <span onClick={() => setQ("")} style={{ position: "absolute", right: 10, top: 9, cursor: "pointer", color: "var(--muted)" }}>✕</span>}
      </div>
      <div className="muted" style={{ fontSize: 11, margin: "4px 2px" }}>{results.length} van {items.length} items</div>
      <div style={{ maxHeight: 240, overflowY: "auto", margin: "2px 0 6px", border: "1px solid var(--line)", borderRadius: 10 }}>
        {results.map(it => {
          const p = priceOf(it);
          return (
            <button key={it.item} onClick={() => add(it)} className="kres"
              style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8,
                background: "transparent", border: 0, borderBottom: "1px solid var(--line)", color: "var(--cream)",
                padding: "9px 11px", cursor: "pointer", textAlign: "left", fontSize: 13.5 }}>
              <span>{it.item} <span className="muted" style={{ fontSize: 11 }}>· {it.categorie}</span></span>
              <b style={{ color: p == null ? "var(--muted)" : accent, whiteSpace: "nowrap" }}>{p == null ? "vrije prijs" : eur(p)}</b>
            </button>
          );
        })}
        {results.length === 0 && <div className="muted" style={{ padding: 12, fontSize: 13 }}>Geen resultaten.</div>}
      </div>

      {!isSell && (<><label>Klant (verplicht)</label><input value={klant} onChange={e => setKlant(e.target.value)} placeholder="Naam klant" /></>)}

      <div style={{ flex: 1, minHeight: 60, marginTop: 10 }}>
        {lines.length === 0 ? <p className="muted" style={{ fontSize: 13, margin: "6px 0" }}>Klik items hierboven om ze toe te voegen. 🛒</p> : (
          <div>
            {lines.map((l, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderBottom: "1px solid var(--line)" }}>
                <span style={{ flex: 1, fontSize: 13.5, minWidth: 0 }}>{l.item}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <button className="qbtn" onClick={() => setQty(i, -1)}>−</button>
                  <span style={{ width: 22, textAlign: "center", fontWeight: 700 }}>{l.aantal}</span>
                  <button className="qbtn" onClick={() => setQty(i, 1)}>+</button>
                </div>
                <input type="number" value={l.prijs_ps} onChange={e => setPrice(i, Number(e.target.value))}
                  style={{ width: 76, padding: "5px 7px", fontSize: 13 }} />
                <b style={{ width: 62, textAlign: "right", fontSize: 13 }}>{eur(l.aantal * l.prijs_ps)}</b>
                <span onClick={() => del(i)} style={{ color: "var(--red)", cursor: "pointer", fontWeight: 900, padding: "0 2px" }}>✕</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
        <div><span className="muted" style={{ fontSize: 12 }}>Totaal</span><div className="display" style={{ fontSize: 30, color: accent }}>{eur(total)}</div></div>
        <label style={{ display: "flex", alignItems: "center", gap: 7, textTransform: "none", color: "var(--cream)", margin: 0, fontSize: 13 }}>
          <input type="checkbox" style={{ width: "auto" }} checked={paid} onChange={e => setPaid(e.target.checked)} /> Betaald?
        </label>
      </div>
      <input value={note} onChange={e => setNote(e.target.value)} placeholder="Notitie (optioneel)" style={{ marginTop: 8 }} />
      {msg && <p style={{ color: msg.err ? "var(--red)" : accent, fontSize: 13, margin: "8px 0 0" }}>{msg.t}</p>}
      <button className={"btn" + (isSell ? "" : " red")} style={{ width: "100%", marginTop: 12, color: "#fff", fontSize: 15 }}
        disabled={busy} onClick={submit}>{busy ? "Bezig…" : `REGISTREER ${mode.toUpperCase()}`}</button>
      <style>{`.kres:hover{background:rgba(255,255,255,.04) !important}
        .qbtn{width:26px;height:26px;border-radius:7px;border:1px solid var(--line);background:var(--panel2);color:var(--cream);cursor:pointer;font-size:16px;line-height:1}
        .qbtn:hover{border-color:${accent};color:${accent}}`}</style>
    </div>
  );
}
