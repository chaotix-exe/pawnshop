import { requireUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function InfoPage() {
  await requireUser();
  const { data: team } = await supabaseAdmin().from("profiles")
    .select("username,naam,rol,functie,bio,foto_url").order("rol").order("username");

  const waarden = [
    { icon: "💵", t: "Altijd Cash Ready", d: "Kom je langs met spullen? Je loopt buiten met geld op zak. Geen gedoe, geen wachten." },
    { icon: "🤝", t: "Eerlijke deals", d: "Onze prijslijst is een richtlijn — er is altijd ruimte om te onderhandelen. We houden het fair." },
    { icon: "🔒", t: "Vertrouwelijk & veilig", d: "Wat door onze deur komt, blijft tussen ons. Discretie hoort bij het vak." },
    { icon: "🧰", t: "We kopen (bijna) alles", d: "Sieraden, elektronica, gereedschap, materialen, erts, verzamelobjecten… als het waarde heeft, praten we." },
  ];
  const categorieen = ["Sieraden", "Vishengels & visgerei", "Elektronica", "Gereedschap", "Materialen", "Zilver & erts", "Documenten & verzamelobjecten", "En veel meer"];

  return (
    <div>
      <div className="panel" style={{ padding: 0, overflow: "hidden", position: "relative" }}>
        <img src="/images/shop.jpg" alt="Miko's Pawn Shop" style={{ width: "100%", height: 260, objectFit: "cover", display: "block", filter: "brightness(.6)" }} />
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: 22, background: "linear-gradient(180deg,transparent,rgba(8,12,7,.85))" }}>
          <div className="brand" style={{ fontSize: 40, lineHeight: .9 }}><span className="g">MIKO'S</span> <span className="r">PAWN SHOP</span></div>
          <p style={{ margin: "6px 0 0", color: "var(--cream)", fontWeight: 600 }}>Altijd open, soms gesloten. · De beste prijzen in de stad.</p>
        </div>
      </div>

      <div className="panel">
        <h2 style={{ fontSize: 22, margin: "0 0 8px" }}>Onze missie</h2>
        <p style={{ lineHeight: 1.6, margin: 0 }}>
          Miko's Pawn Shop is meer dan een winkel — het is de eerste halte voor wie net in de stad
          is aangekomen. <b className="green">Nieuwe inwoners op weg helpen</b>, dáár draait het om.
          Geen startkapitaal? Wij kopen je gevonden spullen op zodat je een eerste zak geld op zak hebt.
          Net iets nodig om aan de slag te gaan — een hengel, gereedschap, een lockpick? Wij verkopen
          wat jij nodig hebt. Iedereen verdient een eerlijke start, en bij ons krijg je die: snel,
          contant en zonder oordeel.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12, marginBottom: 16 }}>
        {waarden.map(w => (
          <div key={w.t} className="panel" style={{ margin: 0 }}>
            <div style={{ fontSize: 26 }}>{w.icon}</div>
            <div className="display" style={{ fontSize: 16, marginTop: 6 }}>{w.t}</div>
            <p style={{ color: "var(--muted)", fontSize: 13, lineHeight: 1.5, margin: "4px 0 0" }}>{w.d}</p>
          </div>
        ))}
      </div>

      <div className="panel info-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, alignItems: "center" }}>
        <div>
          <h2 style={{ fontSize: 20, margin: "0 0 10px" }}>Wij verkopen wat jij nodig hebt</h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
            {categorieen.map(c => <span key={c} className="tag">{c}</span>)}
          </div>
          <p style={{ color: "var(--muted)", fontSize: 13, marginTop: 12 }}>Kwaliteit, betaalbaar & altijd cash. Kom langs of neem contact op!</p>
        </div>
        <img src="/images/poster-verkoop.jpg" alt="Wij verkopen wat jij nodig hebt" style={{ width: "100%", borderRadius: 12, border: "1px solid var(--line)" }} />
      </div>

      <div className="panel">
        <h2 style={{ fontSize: 22, margin: "0 0 12px" }}>Het team</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12 }}>
          {(team || []).map((m: any) => (
            <div key={m.username} style={{ background: "var(--panel2)", border: "1px solid var(--line)", borderRadius: 14, padding: 14, display: "flex", gap: 12, alignItems: "flex-start" }}>
              <div style={{ width: 56, height: 56, borderRadius: 12, overflow: "hidden", flex: "0 0 auto", background: "#0e120c", border: "1px solid var(--line)", display: "grid", placeItems: "center" }}>
                {m.foto_url ? <img src={m.foto_url} alt={m.naam || m.username} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : <span style={{ fontFamily: "Anton, sans-serif", fontSize: 22, color: "var(--green)" }}>{(m.naam || m.username || "?")[0].toUpperCase()}</span>}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 700 }}>{m.naam || m.username}
                  {m.rol === "admin" && <span style={{ marginLeft: 6, fontSize: 10, color: "var(--gold)", border: "1px solid var(--gold)", borderRadius: 6, padding: "1px 5px", verticalAlign: "middle" }}>ADMIN</span>}
                </div>
                <div style={{ color: "var(--green)", fontSize: 13, fontWeight: 600 }}>{m.functie || (m.rol === "admin" ? "Eigenaar" : "Medewerker")}</div>
                {m.bio && <p style={{ color: "var(--muted)", fontSize: 12, lineHeight: 1.5, margin: "6px 0 0" }}>{m.bio}</p>}
              </div>
            </div>
          ))}
        </div>
        <p style={{ color: "var(--muted)", fontSize: 12, marginTop: 12 }}>Functie, foto en bio stel je in onder <b>Admin → Medewerker-logins</b>.</p>
      </div>

      <style>{`@media(max-width:640px){.info-2col{grid-template-columns:1fr !important}}`}</style>
    </div>
  );
}
