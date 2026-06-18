"use client";
import { useFormState, useFormStatus } from "react-dom";
import { login } from "@/app/actions/auth";

function Submit() {
  const { pending } = useFormStatus();
  return <button className="btn" style={{ width: "100%" }} disabled={pending}>{pending ? "Bezig…" : "Inloggen"}</button>;
}

export default function LoginPage() {
  const [state, action] = useFormState(login, null as null | { error?: string });
  return (
    <div style={{ maxWidth: 380, margin: "10vh auto", padding: 16 }}>
      <div style={{ textAlign: "center", marginBottom: 18 }}>
        <h1 style={{ color: "#3ddc4a", fontWeight: 900, fontSize: 30, margin: 0 }}>MIKO'S <span style={{ color: "#e23b3b" }}>PAWN SHOP</span></h1>
        <p style={{ color: "#9aa593", letterSpacing: 2, fontSize: 12 }}>ADMINISTRATIE</p>
      </div>
      <form action={action} className="panel">
        <label>Gebruikersnaam</label>
        <input name="username" autoFocus autoComplete="username" />
        <label>Wachtwoord</label>
        <input name="password" type="password" autoComplete="current-password" />
        {state?.error && <p style={{ color: "#e23b3b", fontSize: 13 }}>{state.error}</p>}
        <div style={{ marginTop: 14 }}><Submit /></div>
      </form>
    </div>
  );
}
