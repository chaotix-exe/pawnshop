"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { deletePromo } from "@/app/actions/promo";

export default function PromoGrid({ items }: { items: { name: string; url: string }[] }) {
  const router = useRouter();
  const [copied, setCopied] = useState("");
  function copy(url: string, name: string) {
    navigator.clipboard.writeText(url).then(() => { setCopied(name); setTimeout(() => setCopied(""), 1500); });
  }
  async function del(fd: FormData) { if (confirm("Verwijderen?")) { await deletePromo(fd); router.refresh(); } }

  if (!items.length) return <div className="panel"><p className="muted" style={{ margin: 0 }}>Nog geen promomateriaal geüpload.</p></div>;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 16 }}>
      {items.map(it => (
        <div key={it.name} className="panel lift" style={{ margin: 0, padding: 12 }}>
          <div style={{ borderRadius: 10, overflow: "hidden", border: "1px solid var(--line)", background: "#000", aspectRatio: "1 / 1", display: "grid", placeItems: "center" }}>
            <img src={it.url} alt={it.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <button className="btn sm" style={{ flex: 1 }} onClick={() => copy(it.url, it.name)}>{copied === it.name ? "Gekopieerd ✓" : "Kopieer link"}</button>
            <a className="btn ghost sm" href={it.url} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>↗</a>
            <form action={del}><input type="hidden" name="name" value={it.name} /><button className="btn red sm">✕</button></form>
          </div>
        </div>
      ))}
    </div>
  );
}
