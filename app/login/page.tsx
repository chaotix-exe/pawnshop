"use client";
import { useFormState, useFormStatus } from "react-dom";
import { login } from "@/app/actions/auth";

function Submit() {
  const { pending } = useFormStatus();
  return <button className="btn" style={{ width: "100%", fontSize: 16, padding: "13px" }} disabled={pending}>{pending ? "Bezig…" : "Inloggen"}</button>;
}

export default function LoginPage() {
  const [state, action] = useFormState(login, null as null | { error?: string });
  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 16 }}>
      <div className="login-grid" style={{ width: "100%", maxWidth: 880, display: "grid", gridTemplateColumns: "1.05fr .95fr", borderRadius: 20, overflow: "hidden", border: "1px solid var(--line)", boxShadow: "0 30px 90px rgba(0,0,0,.55)" }}>
        <div style={{ position: "relative", minHeight: 460, background: "#000" }}>
          <img src="/images/shop.jpg" alt="Miko's Pawn Shop" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", filter: "brightness(.75)" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(8,12,7,.15),rgba(8,12,7,.85))", display: "flex", alignItems: "flex-end", padding: 24 }}>
            <div>
              <div className="brand" style={{ fontSize: 38, lineHeight: .9 }}><span className="g">MIKO'S</span> <span className="r">PAWN SHOP</span></div>
              <p style={{ margin: "6px 0 0", color: "var(--cream)", fontWeight: 600, fontSize: 14 }}>De beste prijzen in de stad. Altijd cash.</p>
            </div>
          </div>
        </div>
        <div style={{ background: "linear-gradient(180deg,#161b14,#0e120c)", padding: "40px 34px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <img src="/images/banner.jpg" alt="" style={{ height: 44, width: "fit-content", borderRadius: 8, border: "1px solid var(--line)", marginBottom: 18 }} />
          <h1 style={{ fontSize: 22, margin: "0 0 2px" }}>Welkom terug</h1>
          <p style={{ color: "var(--muted)", fontSize: 13, margin: "0 0 20px" }}>Log in om de kassa te openen.</p>
          <form action={action}>
            <label>Gebruikersnaam</label>
            <input name="username" autoFocus autoComplete="username" />
            <label>Wachtwoord</label>
            <input name="password" type="password" autoComplete="current-password" />
            {state?.error && <p style={{ color: "var(--red)", fontSize: 13, marginTop: 10 }}>{state.error}</p>}
            <div style={{ marginTop: 20 }}><Submit /></div>
          </form>
        </div>
      </div>
      <style>{`@media(max-width:640px){.login-grid{grid-template-columns:1fr !important}.login-grid>div:first-child{min-height:190px !important}}`}</style>
    </div>
  );
}
