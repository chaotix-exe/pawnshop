"use client";
import { useFormState, useFormStatus } from "react-dom";
import { login } from "@/app/actions/auth";

function Submit() {
  const { pending } = useFormStatus();
  return <button className="btn" style={{ width: "100%", fontSize: 16 }} disabled={pending}>{pending ? "Bezig…" : "Inloggen"}</button>;
}

export default function LoginPage() {
  const [state, action] = useFormState(login, null as null | { error?: string });
  return (
    <div style={{ minHeight: "100vh", display: "grid", gridTemplateColumns: "1fr", placeItems: "center", padding: 16 }}>
      <div style={{ width: "100%", maxWidth: 920, display: "grid", gridTemplateColumns: "1fr", gap: 20 }}>
        <div className="login-grid" style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 0, borderRadius: 20, overflow: "hidden", border: "1px solid var(--line)", boxShadow: "0 30px 80px rgba(0,0,0,.5)" }}>
          <div style={{ position: "relative", minHeight: 420, background: "#000" }}>
            <img src="/images/poster-open.jpg" alt="Miko's Pawn Shop" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          </div>
          <div style={{ background: "linear-gradient(180deg,#161b14,#0e120c)", padding: "34px 30px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div className="brand" style={{ fontSize: 34, marginBottom: 2 }}><span className="g">MIKO'S</span></div>
            <div className="brand" style={{ fontSize: 22, marginBottom: 6 }}><span className="r">PAWN SHOP</span></div>
            <p style={{ color: "var(--muted)", fontSize: 12, letterSpacing: 2, margin: "0 0 22px" }}>ADMINISTRATIE · CASH READY</p>
            <form action={action}>
              <label>Gebruikersnaam</label>
              <input name="username" autoFocus autoComplete="username" />
              <label>Wachtwoord</label>
              <input name="password" type="password" autoComplete="current-password" />
              {state?.error && <p style={{ color: "var(--red)", fontSize: 13, marginTop: 10 }}>{state.error}</p>}
              <div style={{ marginTop: 18 }}><Submit /></div>
            </form>
          </div>
        </div>
      </div>
      <style>{`@media(max-width:640px){.login-grid{grid-template-columns:1fr !important}.login-grid>div:first-child{min-height:200px !important}}`}</style>
    </div>
  );
}
