"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { markReimbursed } from "@/app/actions/payouts";

type Row = { id: number; medewerker: string | null; item: string; aantal: number; totaal: number; datum: string; klant: string | null };
const eur = (n: number) => "€" + Math.round(n || 0).toLocaleString("nl-NL");

export default function Payouts({ rows, isAdmin }: { rows: Row[]; isAdmin: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState("");

  const groups: Record<string, Row[]> = {};
  rows.forEach(r => { const k = r.medewerker || "Onbekend"; (groups[k] = groups[k] || []).push(r); });
  const names = Object.keys(groups).sort();
  const grandTotal = rows.reduce((a, r) => a + (Number(r.totaal) || 0), 0);

  async function settle(name: string, ids: number[]) {
    if (!confirm(`Alle inkopen van ${name} (${eur(groups[name].reduce((a, r) => a + r.totaal, 0))}) als uitbetaald markeren?`)) return;
    setBusy(name);
    try { await markReimbursed(ids); router.refresh(); } catch (e: any) { alert("Fout: " + e.message); }
    setBusy("");
  }

  if (!rows.length) return null;

  return (
    <div className="panel" style={{ borderColor: "var(--redd)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
        <h3 style={{ fontSize: 15, color: "var(--gold)", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>💸 Nog uit te betalen aan medewerkers</h3>
        <span className="tag" style={{ borderColor: "var(--redd)" }}>Totaal openstaand: <b className="red" style={{ marginLeft: 5 }}>{eur(grandTotal)}</b></span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 12 }}>
        {names.map(name => {
          const list = groups[name];
          const tot = list.reduce((a, r) => a + (Number(r.totaal) || 0), 0);
          return (
            <div key={name} style={{ background: "var(--panel2)", border: "1px solid var(--line)", borderRadius: 12, padding: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <b>{name}</b><b className="red">{eur(tot)}</b>
              </div>
              <div style={{ maxHeight: 150, overflowY: "auto", marginBottom: 10 }}>
                {list.map(r => (
                  <div key={r.id} style={{ display: "flex", justifyContent: "space-between", gap: 8, fontSize: 13, padding: "3px 0", borderBottom: "1px solid var(--line)" }}>
                    <span>{r.aantal}× {r.item} <span className="muted" style={{ fontSize: 11 }}>{r.klant ? "· " + r.klant : ""}</span></span>
                    <span className="muted">{eur(r.totaal)}</span>
                  </div>
                ))}
              </div>
              {isAdmin
                ? <button className="btn sm" style={{ width: "100%" }} disabled={busy === name} onClick={() => settle(name, list.map(r => r.id))}>{busy === name ? "Bezig…" : "✓ Uitbetaald"}</button>
                : <div className="muted" style={{ fontSize: 12, textAlign: "center" }}>{list.length} inkoop{list.length > 1 ? "en" : ""} open</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
