import { requireUser } from "@/lib/auth";
import { logout } from "@/app/actions/auth";
import NavBar from "./NavBar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const me = await requireUser();
  return (
    <div className="shell">
      <aside className="sidebar">
        <img src="/images/banner.jpg" alt="Miko's Pawn Shop" className="logo" />
        <div className="who">Ingelogd als <b style={{ color: "var(--cream)" }}>{me.naam || me.username}</b><br />{me.rol}</div>
        <NavBar isAdmin={me.rol === "admin"} />
        <div className="spacer" />
        <form action={logout}><button className="btn ghost sm" style={{ width: "100%" }}>Uitloggen</button></form>
      </aside>
      <main className="main">{children}</main>
    </div>
  );
}
