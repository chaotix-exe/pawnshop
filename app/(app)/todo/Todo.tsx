"use client";
import { useState } from "react";
import { addTodo, completeTodo } from "@/app/actions/data";
import { useRouter } from "next/navigation";

type T = { id: number; item: string; aantal: number | null; voor: string | null; toegevoegd_door: string | null; notitie: string | null; created_at: string };

export default function Todo({ open }: { open: T[] }) {
  const router = useRouter();
  const [f, setF] = useState({ item: "", aantal: "", voor: "", notitie: "" });
  const [msg, setMsg] = useState("");

  async function add() {
    if (!f.item.trim()) { setMsg("Vul een item in"); return; }
    try { await addTodo({ item: f.item, aantal: f.aantal ? Number(f.aantal) : undefined, voor: f.voor, notitie: f.notitie }); setF({ item: "", aantal: "", voor: "", notitie: "" }); router.refresh(); }
    catch (e: any) { setMsg("Fout: " + e.message); }
  }
  async function done(id: number) { await completeTodo(id); router.refresh(); }

  return (
    <div>
      <div className="panel">
        <h2 style={{ color: "#3ddc4a" }}>Craft to-do toevoegen</h2>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <div style={{ flex: 2, minWidth: 160 }}><label>Wat craften/bijvullen</label><input value={f.item} onChange={e => setF({ ...f, item: e.target.value })} /></div>
          <div style={{ width: 90 }}><label>Aantal</label><input type="number" value={f.aantal} onChange={e => setF({ ...f, aantal: e.target.value })} /></div>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 140 }}><label>Voor (wie/klant)</label><input value={f.voor} onChange={e => setF({ ...f, voor: e.target.value })} /></div>
          <div style={{ flex: 1, minWidth: 140 }}><label>Notitie</label><input value={f.notitie} onChange={e => setF({ ...f, notitie: e.target.value })} /></div>
        </div>
        {msg && <p style={{ color: "#e23b3b", fontSize: 13 }}>{msg}</p>}
        <div style={{ marginTop: 12 }}><button className="btn sm" onClick={add}>+ Toevoegen</button></div>
      </div>
      <div className="panel">
        <h3 style={{ color: "#f0c43c", fontSize: 14 }}>Openstaand</h3>
        {open.length === 0 ? <p style={{ color: "#9aa593" }}>Niets openstaand 🎉</p> : open.map(t => (
          <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 10, background: "#20261d", border: "1px solid #2c3327", borderRadius: 10, padding: "10px 12px", marginBottom: 8 }}>
            <button className="btn sm" onClick={() => done(t.id)}>✓</button>
            <div style={{ flex: 1 }}>
              <b>{t.aantal ? t.aantal + "x " : ""}{t.item}</b>
              <div style={{ color: "#9aa593", fontSize: 12 }}>{t.voor ? "voor " + t.voor + " · " : ""}{t.toegevoegd_door ? "door " + t.toegevoegd_door + " · " : ""}{new Date(t.created_at).toLocaleDateString("nl-NL")}{t.notitie ? " · " + t.notitie : ""}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
