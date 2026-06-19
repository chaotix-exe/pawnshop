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
        <img src="/images/shop.jpg" alt="Miko's Pawn Shop" style={{ width: "100%", height: 300, objectFit: "cover", display: "block", filter: "brightness(.6)" }} />
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: 28, background: "linear-gradient(180deg,transparent,rgba(8,12,7,.88))" }}>
          <div className="brand" style={{ fontSize: 46, lineHeight: .9 }}><span className="g">MIKO'S</span> <span className="r">PAWN SHOP</span></div>
          <p style={{ margin: "8px 0 0", color: "var(--cream)", fontWeight: 600, fontSize: 16 }}>Altijd open, soms gesloten. · De beste prijzen in de stad.</p>
        </div>
      </div>

      <div className="panel">
        <h2 style={{ fontSize: 24, margin: "0 0 10px" }}>Onze missie</h2>
        <p style={{ lineHeight: 1.7, margin: 0, fontSize: 16 }}>
          Miko's Pawn Shop is meer dan een winkel — het is de eerste halte voor wie net in de stad
          is aangekomen. <b className="green">Nieuwe inwoners op weg helpen</b>, dáár draait het om.
          Geen startkapitaal? Wij kopen je gevonden spullen op zodat je een eerste zak geld op zak hebt.
          Net iets nodig om aan de slag te gaan — een hengel, gereedschap, een lockpick? Wij verkopen
          wat jij nodig hebt. Iedereen verdient een eerlijke start, en bij ons krijg je die: snel,
          contant en zonder oordeel.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))", gap: 14, marginBottom: 16 }}>
        {waarden.map(w => (
          <div key={w.t} className="panel lift" style={{ margin: 0, padding: 20 }}>
            <div style={{ fontSize: 32 }}>{w.icon}</div>
            <div className="display" style={{ fontSize: 20, marginTop: 8 }}>{w.t}</div>
            <p style={{ color: "var(--cream)", opacity: .8, fontSize: 15, lineHeight: 1.6, margin: "6px 0 0" }}>{w.d}</p>
          </div>
        ))}
      </div>

      <div className="panel info-2col" style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 24, alignItems: "center", padding: 24 }}>
        <div>
          <h2 style={{ fontSize: 24, margin: "0 0 6px" }}>Wij verkopen wat jij nodig hebt</h2>
          <p style={{ color: "var(--cream)", opacity: .8, fontSize: 15, margin: "0 0 16px" }}>Kwaliteit, betaalbaar &amp; altijd cash. Kom langs of neem contact op!</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 9 }}>
            {categorieen.map(c => <span key={c} className="tag" style={{ fontSize: 14, padding: "7px 14px" }}>{c}</span>)}
          </div>
        </div>
        <img src="/images/poster-verkoop.jpg" alt="Wij verkopen wat jij nodig hebt" style={{ width: "100%", borderRadius: 14, border: "1px solid var(--line)" }} />
      </div>

      <div className="panel" style={{ padding: 24 }}>
        <h2 style={{ fontSize: 24, margin: "0 0 4px" }}>Het team</h2>
        <p style={{ color: "var(--muted)", fontSize: 14, margin: "0 0 18px" }}>De gezichten achter de toonbank.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 16 }}>
          {(team || []).map((m: any) => (
            <div key={m.username} className="lift" style={{ background: "linear-gradient(180deg,var(--panel2),#141a12)", border: "1px solid var(--line)", borderRadius: 16, padding: 20, textAlign: "center", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 52, background: "linear-gradient(90deg,#1f5d27,#143f1a)" }} />
              <div style={{ position: "relative", width: 92, height: 92, borderRadius: "50%", overflow: "hidden", margin: "16px auto 12px", background: "#0e120c", border: "3px solid var(--bg)", boxShadow: "0 0 0 2px var(--green)", display: "grid", placeItems: "center" }}>
                {m.foto_url ? <img src={m.foto_url} alt={m.naam || m.username} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : <span style={{ fontFamily: "Anton, sans-serif", fontSize: 38, color: "var(--green)" }}>{(m.naam || m.username || "?")[0].toUpperCase()}</span>}
              </div>
              <div style={{ fontWeight: 700, fontSize: 17 }}>{m.naam || m.username}</div>
              <div style={{ color: "var(--green)", fontSize: 14, fontWeight: 600, margintop: 2 }}>{m.functie || (m.rol === "admin" ? "Eigenaar" : "Medewerker")}</div>
              {m.rol === "admin" && <div style={{ marginTop: 6 }}><span style={{ fontSize: 10, color: "var(--gold)", border: "1px solid var(--gold)", borderRadius: 6, padding: "2px 7px", letterSpacing: .5 }}>ADMIN</span></div>}
              {m.bio && <p style={{ color: "var(--cream)", opacity: .75, fontSize: 13.5, lineHeight: 1.55, margin: "12px 0 0" }}>{m.bio}</p>}
            </div>
          ))}
        </div>
        <p style={{ color: "var(--muted)", fontSize: 13, marginTop: 16 }}>Functie, foto en bio stel je in onder <b>Admin → Medewerker-logins</b>.</p>
      </div>

      <style>{`@media(max-width:680px){.info-2col{grid-template-columns:1fr !important}}`}</style>
    </div>
  );
}
