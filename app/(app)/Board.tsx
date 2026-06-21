"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { addAnnouncement, deleteAnnouncement } from "@/app/actions/board";

type A = { id: number; tekst: string; author: string | null; pinned: boolean; created_at: string };

export default function Board({ items, isAdmin }: { items: A[]; isAdmin: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const pinned = items.find(i => i.pinned);
  const rest = items.filter(i => !i.pinned);

  async function post(fd: FormData) { await addAnnouncement(fd); setOpen(false); router.refresh(); }
  async function del(fd: FormData) { if (confirm("Bericht verwijderen?")) { await deleteAnnouncement(fd); router.refresh(); } }

  return (
    <div className="panel" style={{ borderColor: "var(--greend)", background: "linear-gradient(180deg,#15230f,#10160d)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: items.length ? 12 : 0 }}>
        <h3 style={{ fontSize: 15, color: "var(--gold)", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>📣 Mededelingenbord</h3>
        {isAdmin && <button className="btn sm" onClick={() => setOpen(o => !o)}>{open ? "Sluiten" : "+ Bericht"}</button>}
      </div>

      {isAdmin && open && (
        <form action={post} style={{ marginBottom: 14, background: "var(--panel2)", border: "1px solid var(--line)", borderRadius: 10, padding: 12 }}>
          <textarea name="tekst" rows={2} placeholder="Bericht voor het team…" autoFocus />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 7, textTransform: "none", color: "var(--cream)", margin: 0 }}>
              <input type="checkbox" name="pinned" style={{ width: "auto" }} /> 📌 Vastpinnen bovenaan
            </label>
            <button className="btn sm">Plaatsen</button>
          </div>
        </form>
      )}

      {items.length === 0 && <p className="muted" style={{ margin: 0, fontSize: 13 }}>Nog geen mededelingen.</p>}

      {pinned && (
        <div style={{ background: "rgba(240,196,60,.10)", border: "1px solid var(--gold)", borderRadius: 10, padding: "10px 12px", marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
            <div><span style={{ fontSize: 12 }}>📌 </span><b style={{ whiteSpace: "pre-wrap" }}>{pinned.tekst}</b></div>
            {isAdmin && <form action={del}><input type="hidden" name="id" value={pinned.id} /><button className="btn red sm">✕</button></form>}
          </div>
          <div className="muted" style={{ fontSize: 11, marginTop: 4 }}>{pinned.author} · {new Date(pinned.created_at).toLocaleDateString("nl-NL")}</div>
        </div>
      )}

      {rest.map(a => (
        <div key={a.id} style={{ display: "flex", justifyContent: "space-between", gap: 10, padding: "8px 0", borderTop: "1px solid var(--line)" }}>
          <div>
            <div style={{ whiteSpace: "pre-wrap" }}>{a.tekst}</div>
            <div className="muted" style={{ fontSize: 11, marginTop: 2 }}>{a.author} · {new Date(a.created_at).toLocaleDateString("nl-NL")}</div>
          </div>
          {isAdmin && <form action={del}><input type="hidden" name="id" value={a.id} /><button className="btn ghost sm">✕</button></form>}
        </div>
      ))}
    </div>
  );
}
