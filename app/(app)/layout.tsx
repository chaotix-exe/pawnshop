import { requireUser } from "@/lib/auth";
import { logout } from "@/app/actions/auth";
import NavBar from "./NavBar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const me = await requireUser();
  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: 16 }}>
      <header className="panel" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, padding: 14, background: "linear-gradient(135deg,#15301a,#0b110b)", borderColor: "var(--greend)", overflow: "hidden", position: "relative" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0 }}>
          <img src="/images/banner.jpg" alt="Miko's Pawn Shop" style={{ height: 46, borderRadius: 8, border: "1px solid var(--line)" }} />
          <div style={{ minWidth: 0 }}>
            <div className="brand" style={{ fontSize: 20, lineHeight: 1 }}><span className="g">MIKO'S</span> <span className="r">PAWN SHOP</span></div>
            <div style={{ color: "var(--muted)", fontSize: 12 }}>Ingelogd als <b style={{ color: "var(--cream)" }}>{me.naam || me.username}</b> · {me.rol}</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span className="cash-badge" style={{ fontSize: 12 }}>CASH READY!</span>
          <form action={logout}><button className="btn ghost sm">Uitloggen</button></form>
        </div>
      </header>
      <NavBar isAdmin={me.rol === "admin"} />
      {children}
    </div>
  );
}
