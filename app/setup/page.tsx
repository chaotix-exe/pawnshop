"use client";
import { useFormState, useFormStatus } from "react-dom";
import { setupFirstAdmin } from "@/app/actions/auth";

function Submit() {
  const { pending } = useFormStatus();
  return <button className="btn" style={{ width: "100%" }} disabled={pending}>{pending ? "Bezig…" : "Admin aanmaken"}</button>;
}

export default function SetupPage() {
  const [state, action] = useFormState(setupFirstAdmin, null as null | { error?: string });
  return (
    <div style={{ maxWidth: 420, margin: "8vh auto", padding: 16 }}>
      <h1 style={{ color: "#3ddc4a" }}>Eenmalige setup</h1>
      <p style={{ color: "#9aa593", fontSize: 14 }}>Maak hier de eerste admin aan. Dit scherm werkt alleen zolang er nog geen gebruikers zijn.</p>
      <form action={action} className="panel">
        <label>Gebruikersnaam</label><input name="username" autoFocus />
        <label>Naam</label><input name="naam" />
        <label>Wachtwoord (min. 6 tekens)</label><input name="password" type="password" />
        {state?.error && <p style={{ color: "#e23b3b", fontSize: 13 }}>{state.error}</p>}
        <div style={{ marginTop: 14 }}><Submit /></div>
      </form>
    </div>
  );
}
