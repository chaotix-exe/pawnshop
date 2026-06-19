"use client";
import { useMemo, useState } from "react";
import { addTodo } from "@/app/actions/data";

type Ing = { ingredient: string; aantal: number; eenheid: string; opmerking: string | null };
type Recipe = { id: number; station: string; product: string; tijd: number; recipe_ingredients: Ing[] };
const eur = (n: number) => "€" + Math.round(n || 0).toLocaleString("nl-NL");

export default function Craft({ recipes, prices }: { recipes: Recipe[]; prices: Record<string, number> }) {
  const stations = useMemo(() => [...new Set(recipes.map(r => r.station))], [recipes]);
  const [station, setStation] = useState(stations[0] || "");
  const prods = useMemo(() => recipes.filter(r => r.station === station).map(r => r.product).sort(), [recipes, station]);
  const [product, setProduct] = useState(prods[0] || "");
  const [qty, setQty] = useState(1);
  const [out, setOut] = useState<null | any>(null);
  const [msg, setMsg] = useState("");

  const rec = recipes.find(r => r.station === station && r.product === product);
  function calc() {
    if (!rec) return;
    let matRows: any[] = [], tools: string[] = [], money = 0, matTotal = 0, unknown = false;
    rec.recipe_ingredients.forEach(ing => {
      if (ing.eenheid === "%") { tools.push(`${ing.ingredient}: ${ing.aantal * qty}%${ing.opmerking ? " · " + ing.opmerking : ""}`); return; }
      if (ing.ingredient.toLowerCase() === "geld") { money += ing.aantal * qty; return; }
      const need = ing.aantal * qty; const pr = prices[ing.ingredient.toLowerCase()];
      const cost = pr != null ? pr * need : null; if (pr != null) matTotal += cost!; else unknown = true;
      matRows.push({ name: ing.ingredient, note: ing.opmerking, need, pr: pr ?? null, cost });
    });
    setOut({ matRows, tools, money, matTotal, unknown, tijd: rec.tijd });
  }
  async function toTodo() {
    try { await addTodo({ item: product, aantal: qty, voor: "voorraad" }); setMsg("Op de to-do lijst gezet ✓"); }
    catch (e: any) { setMsg("Fout: " + e.message); }
  }

  return (
    <div className="panel">
      <h2 style={{ fontSize: 22, margin: "0 0 12px" }}>Craft-calculator</h2>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
        <div style={{ minWidth: 150 }}><label>Tafel</label><select value={station} onChange={e => { setStation(e.target.value); }}>{stations.map(s => <option key={s}>{s}</option>)}</select></div>
        <div style={{ flex: 2, minWidth: 160 }}><label>Product</label><select value={product} onChange={e => setProduct(e.target.value)}>{prods.map(p => <option key={p}>{p}</option>)}</select></div>
        <div style={{ width: 80 }}><label>Aantal</label><input type="number" min={1} value={qty} onChange={e => setQty(Number(e.target.value))} /></div>
        <button className="btn sm" onClick={calc}>Bereken</button>
      </div>
      {out && (
        <div style={{ marginTop: 12 }}>
          <h3 style={{ color: "#f0c43c", fontSize: 14 }}>Materialen nodig</h3>
          <table><thead><tr><th>Materiaal</th><th className="r">Nodig</th><th className="r">Richtprijs</th><th className="r">Kosten</th></tr></thead>
            <tbody>{out.matRows.length ? out.matRows.map((m: any, i: number) => <tr key={i}><td>{m.name}{m.note ? <span style={{ color: "#9aa593" }}> ({m.note})</span> : ""}</td><td className="r">{m.need}x</td><td className="r">{m.pr != null ? eur(m.pr) : "—"}</td><td className="r">{m.cost != null ? eur(m.cost) : "?"}</td></tr>) : <tr><td colSpan={4} style={{ color: "#9aa593" }}>Geen grondstoffen</td></tr>}</tbody>
          </table>
          {out.tools.length > 0 && <><h3 style={{ color: "#f0c43c", fontSize: 14 }}>Gereedschap / blueprints (slijtage)</h3><div>{out.tools.map((t: string, i: number) => <span key={i} style={{ display: "inline-block", background: "#20261d", border: "1px solid #2c3327", borderRadius: 20, padding: "3px 10px", fontSize: 12, color: "#9aa593", margin: "2px 4px 2px 0" }}>{t}</span>)}</div></>}
          {out.money > 0 && <><h3 style={{ color: "#f0c43c", fontSize: 14 }}>Cash nodig</h3><div style={{ fontSize: 22, fontWeight: 900, color: "#f0c43c" }}>{eur(out.money)}</div></>}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14 }}>
            <div><span style={{ color: "#9aa593" }}>Geschatte materiaalkost</span><div style={{ fontSize: 24, fontWeight: 900, color: "#3ddc4a" }}>{eur(out.matTotal)}</div></div>
            <button className="btn ghost sm" onClick={toTodo}>📋 Zet op to-do</button>
          </div>
          <p style={{ color: "#9aa593", fontSize: 12 }}>{out.unknown ? "⚠ Sommige materialen hebben geen richtprijs en tellen niet mee. " : ""}Craft-tijd: {out.tijd}s p/stuk.</p>
          {msg && <p style={{ color: "#3ddc4a", fontSize: 13 }}>{msg}</p>}
        </div>
      )}
    </div>
  );
}
