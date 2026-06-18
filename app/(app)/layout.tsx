import { requireUser } from "@/lib/auth";
import { logout } from "@/app/actions/auth";
import Link from "next/link";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const me = await requireUser();
  const nav = [
    { href: "/", label: "📊 Dashboard" },
    { href: "/kassa", label: "💵 Kassa" },
    { href: "/craft", label: "🛠️ Craften" },
    { href: "/todo", label: "📋 To-do" },
  ];
  if (me.rol === "admin") nav.push({ href: "/admin", label: "⚙️ Admin" });
  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: 14 }}>
      <header className="panel" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "linear-gradient(135deg,#15301a,#0d150d)", borderColor: "#2E7D32" }}>
        <div>
          <div style={{ color: "#3ddc4a", fontWeight: 900, fontSize: 24 }}>MIKO'S <span style={{ color: "#e23b3b" }}>PAWN SHOP</span></div>
          <div style={{ color: "#9aa593", fontSize: 12 }}>Ingelogd als {me.naam || me.username} · {me.rol}</div>
        </div>
        <form action={logout}><button className="btn ghost sm">Uitloggen</button></form>
      </header>
      <nav style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
        {nav.map(n => <Link key={n.href} href={n.href} className="btn ghost sm" style={{ textDecoration: "none" }}>{n.label}</Link>)}
      </nav>
      {children}
    </div>
  );
}
