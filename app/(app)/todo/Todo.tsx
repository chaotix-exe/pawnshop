"use client";
import { useState } from "react";
import { addTodo, completeTodo } from "@/app/actions/data";
import { useRouter } from "next/navigation";

type T = { id: number; item: string; aantal: number | null; voor: string | null; toegevoegd_door: string | null; notitie: string | null; created_at: string };

export default function Todo({ open }: { open: T[] }) {
  const router = useRouter();
  const [f, setF] = useState({ item: "", aantal: "", voor: "", notitie: "" });
  const [msg, setMsg] = useState("");
  const [show, setShow] = useState(false);

  async function add() {
    if (!f.item.trim()) { setMsg("Vul een item in"); return; }
    try { await addTodo({ item: f.item, aantal: f.aantal ? Number(f.aantal) : undefined, voor: f.voor, notitie: f.notitie }); setF({ item: "", aantal: "", voor: "", notitie: "" }); setShow(false); router.refresh(); }
    catch (e: any) { setMsg("Fout: " + e.message); }
  }
  async function done(id: number) { await completeTodo(id); router.refresh(); }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
        <h2 className="page" style={{ margin: 0 }}>Craft to-do <span className="muted" style={{ fontSize: 16 }}>· {open.length} open</span></h2>
        <button className="btn" style={{ color: "#fff" }} onClick={() => setShow(s => !s)}>{show ? "Sluiten" : "+ Nieuw"}</button>
      </div>

      {show && (
        <div className="panel">
          <div style={{ display: "grid", gridTemplateColumns: "2fr 90px", gap: 10 }}>
            <div><label>Wat craften / bijvullen</label><input value={f.item} onChange={e => setF({ ...f, item: e.target.value })} autoFocus placeholder="bv. 10x Grinders" /></div>
            <div><label>Aantal</label><input type="number" value={f.aantal} onChange={e => setF({ ...f, aantal: e.target.value })} /></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div><label>Voor (wie/klant)</label><input value={f.voor} onChange={e => setF({ ...f, voor: e.target.value })} placeholder="voorraad / klantnaam" /></div>
            <div><label>Notitie</label><input value={f.notitie} onChange={e => setF({ ...f, notitie: e.target.value })} /></div>
          </div>
          {msg && <p style={{ color: "var(--red)", fontSize: 13 }}>{msg}</p>}
          <div style={{ marginTop: 12 }}><button className="btn sm" style={{ color: "#fff" }} onClick={add}>Toevoegen aan lijst</button></div>
        </div>
      )}

      {open.length === 0 ? (
        <div className="panel" style={{ textAlign: "center", padding: 40 }}>
          <div style={{ fontSize: 40 }}>✅</div>
          <p className="muted" style={{ margin: "8px 0 0" }}>Niets meer op de lijst — alles gecraft!</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 12 }}>
          {open.map(t => (
            <div key={t.id} className="panel lift" style={{ margin: 0, display: "flex", gap: 12, alignItems: "flex-start" }}>
              <button className="btn sm" title="Afvinken" onClick={() => done(t.id)} style={{ color: "#fff", flex: "0 0 auto" }}>✓</button>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{t.aantal ? t.aantal + "× " : ""}{t.item}</div>
                <div className="muted" style={{ fontSize: 12, marginTop: 3 }}>
                  {t.voor ? "🎯 " + t.voor + "  " : ""}{t.toegevoegd_door ? "· " + t.toegevoegd_door + " " : ""}· {new Date(t.created_at).toLocaleDateString("nl-NL")}
                </div>
                {t.notitie && <div className="muted" style={{ fontSize: 12, marginTop: 4, fontStyle: "italic" }}>“{t.notitie}”</div>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
