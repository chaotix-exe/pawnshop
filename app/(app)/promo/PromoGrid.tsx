"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { deletePromo, setPromoLink } from "@/app/actions/promo";

type Item = { path: string; publicUrl: string; customUrl: string; label: string };

export default function PromoGrid({ items, isAdmin }: { items: Item[]; isAdmin: boolean }) {
  const router = useRouter();
  const [copied, setCopied] = useState("");
  const [editing, setEditing] = useState<string>("");

  function copy(url: string, key: string) {
    navigator.clipboard.writeText(url).then(() => { setCopied(key); setTimeout(() => setCopied(""), 1500); });
  }
  async function save(fd: FormData) { await setPromoLink(fd); setEditing(""); router.refresh(); }
  async function del(fd: FormData) { if (confirm("Verwijderen?")) { await deletePromo(fd); router.refresh(); } }

  if (!items.length) return <div className="panel"><p className="muted" style={{ margin: 0 }}>Nog geen promomateriaal geüpload.</p></div>;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(230px,1fr))", gap: 16 }}>
      {items.map(it => {
        const link = it.customUrl || it.publicUrl;
        return (
          <div key={it.path} className="panel lift" style={{ margin: 0, padding: 12 }}>
            <div style={{ borderRadius: 10, overflow: "hidden", border: "1px solid var(--line)", background: "#000", aspectRatio: "1 / 1", display: "grid", placeItems: "center" }}>
              <img src={it.publicUrl} alt={it.label || it.path} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            {it.label && <div style={{ fontSize: 12, marginTop: 8, fontWeight: 600 }}>{it.label}</div>}
            <div style={{ fontSize: 11, marginTop: 4 }}>
              {it.customUrl ? <span className="green">✓ eigen link ingesteld</span> : <span className="muted">geen eigen link — kopieert de standaardlink</span>}
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <button className="btn sm" style={{ flex: 1, color: "#fff" }} onClick={() => copy(link, it.path)}>{copied === it.path ? "Gekopieerd ✓" : "Kopieer link"}</button>
              {isAdmin && <button className="btn ghost sm" onClick={() => setEditing(e => e === it.path ? "" : it.path)} title="Eigen link instellen">🔗</button>}
              {isAdmin && <form action={del}><input type="hidden" name="path" value={it.path} /><button className="btn red sm">✕</button></form>}
            </div>

            {isAdmin && editing === it.path && (
              <form action={save} style={{ marginTop: 10, borderTop: "1px solid var(--line)", paddingTop: 10 }}>
                <input type="hidden" name="path" value={it.path} />
                <label>Eigen link (die in FiveM werkt)</label>
                <input name="custom_url" defaultValue={it.customUrl} placeholder="https://...png" />
                <label>Label</label>
                <input name="label" defaultValue={it.label} />
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  <button className="btn sm" style={{ color: "#fff" }}>Opslaan</button>
                  <button type="button" className="btn ghost sm" onClick={() => setEditing("")}>Annuleer</button>
                </div>
              </form>
            )}
          </div>
        );
      })}
    </div>
  );
}
