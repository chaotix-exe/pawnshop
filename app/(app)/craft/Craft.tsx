"use client";
import { useMemo, useState } from "react";
import { addTodo } from "@/app/actions/data";

type Ing = { ingredient: string; aantal: number; eenheid: string; opmerking: string | null };
type Recipe = { id: number; station: string; product: string; tijd: number; recipe_ingredients: Ing[] };

export default function Craft({ recipes }: { recipes: Recipe[]; prices?: any }) {
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
    const mats: any[] = [], tools: string[] = []; let money = 0;
    rec.recipe_ingredients.forEach(ing => {
      if (ing.eenheid === "%") { tools.push(`${ing.ingredient}: ${ing.aantal * qty}%`); return; }
      if (ing.ingredient.toLowerCase() === "geld") { money += ing.aantal * qty; return; }
      mats.push({ name: ing.ingredient, need: ing.aantal * qty, note: ing.opmerking });
    });
    setOut({ mats, tools, money, tijd: rec.tijd, product, qty }); setMsg("");
  }
  async function toTodo() {
    try { await addTodo({ item: out.product, aantal: out.qty, voor: "voorraad" }); setMsg("Op de to-do lijst gezet ✓"); }
    catch (e: any) { setMsg("Fout: " + e.message); }
  }

  return (
    <div>
      <h2 className="page">Craft-calculator</h2>
      <div className="panel">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr auto auto", gap: 12, alignItems: "end" }} className="craft-top">
          <div><label>Craft-tafel</label><select value={station} onChange={e => { setStation(e.target.value); setOut(null); }}>{stations.map(s => <option key={s}>{s}</option>)}</select></div>
          <div><label>Product</label><select value={product} onChange={e => { setProduct(e.target.value); setOut(null); }}>{prods.map(p => <option key={p}>{p}</option>)}</select></div>
          <div style={{ width: 120 }}><label>Aantal</label>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <button className="qbtn" onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
              <input type="number" min={1} value={qty} onChange={e => setQty(Math.max(1, Number(e.target.value)))} style={{ textAlign: "center" }} />
              <button className="qbtn" onClick={() => setQty(q => q + 1)}>+</button>
            </div>
          </div>
          <button className="btn" style={{ color: "#fff" }} onClick={calc}>Bereken</button>
        </div>
      </div>

      {out && (
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16 }} className="craft-out">
          <div className="panel" style={{ margin: 0 }}>
            <h3 style={{ fontSize: 15, color: "var(--gold)", margin: "0 0 4px" }}>🧱 Benodigde materialen</h3>
            <p className="muted" style={{ fontSize: 12, margin: "0 0 12px" }}>Voor {out.qty}× <b style={{ color: "var(--cream)" }}>{out.product}</b></p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))", gap: 10 }}>
              {out.mats.length ? out.mats.map((m: any, i: number) => (
                <div key={i} style={{ background: "var(--panel2)", border: "1px solid var(--line)", borderRadius: 10, padding: "10px 12px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 13 }}>{m.name}{m.note ? <span className="muted" style={{ fontSize: 10, display: "block" }}>{m.note}</span> : null}</span>
                  <b className="display" style={{ fontSize: 18, color: "var(--green)" }}>{m.need}×</b>
                </div>
              )) : <p className="muted">Geen grondstoffen.</p>}
            </div>
          </div>

          <div className="panel" style={{ margin: 0 }}>
            {out.tools.length > 0 && <>
              <h3 style={{ fontSize: 15, color: "var(--gold)", margin: "0 0 8px" }}>🔧 Gereedschap / blueprints</h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 16 }}>
                {out.tools.map((t: string, i: number) => <span key={i} className="tag">{t}</span>)}
              </div>
            </>}
            {out.money > 0 && <>
              <h3 style={{ fontSize: 15, color: "var(--gold)", margin: "0 0 6px" }}>💵 Cash nodig</h3>
              <div className="display" style={{ fontSize: 26, color: "var(--gold)", marginBottom: 16 }}>€{(out.money).toLocaleString("nl-NL")}</div>
            </>}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
              <span className="tag">⏱️ {out.tijd}s per stuk</span>
              <button className="btn ghost sm" onClick={toTodo}>📋 Zet op to-do</button>
            </div>
            {msg && <p style={{ color: "var(--green)", fontSize: 13, marginTop: 10 }}>{msg}</p>}
          </div>
        </div>
      )}
      <style>{`.qbtn{width:30px;height:34px;border-radius:8px;border:1px solid var(--line);background:var(--panel2);color:var(--cream);cursor:pointer;font-size:17px}
        .qbtn:hover{border-color:var(--green);color:var(--green)}
        @media(max-width:820px){.craft-top{grid-template-columns:1fr 1fr !important}.craft-out{grid-template-columns:1fr !important}}`}</style>
    </div>
  );
}
