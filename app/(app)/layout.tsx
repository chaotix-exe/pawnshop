import { requireUser } from "@/lib/auth";
import { logout } from "@/app/actions/auth";
import NavBar from "./NavBar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const me = await requireUser();
  return (
    <div>
      <header className="topbar">
        <div className="topbar-inner">
          <img src="/images/banner.jpg" alt="Miko's Pawn Shop" className="logo" />
          <NavBar isAdmin={me.rol === "admin"} />
          <div className="topuser">
            <div className="nm">{me.naam || me.username}<br /><span style={{ color: "var(--green)" }}>{me.rol}</span></div>
            <form action={logout}><button className="btn ghost sm">Uitloggen</button></form>
          </div>
        </div>
      </header>
      <main className="container">{children}</main>
    </div>
  );
}
