"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/", label: "Dashboard", icon: "📊" },
  { href: "/kassa", label: "Kassa", icon: "💵" },
  { href: "/craft", label: "Craften", icon: "🛠️" },
  { href: "/todo", label: "To-do", icon: "📋" },
  { href: "/info", label: "Over", icon: "ℹ️" },
];

export default function NavBar({ isAdmin }: { isAdmin: boolean }) {
  const path = usePathname();
  const all = isAdmin ? [...items, { href: "/admin", label: "Admin", icon: "⚙️" }] : items;
  return (
    <nav style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
      {all.map(n => {
        const on = n.href === "/" ? path === "/" : path.startsWith(n.href);
        return (
          <Link key={n.href} href={n.href} style={{
            textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 7,
            padding: "9px 14px", borderRadius: 11, fontWeight: 700, fontSize: 14,
            border: "1px solid " + (on ? "var(--green)" : "var(--line)"),
            background: on ? "linear-gradient(180deg,#2E7D32,#225c26)" : "var(--panel)",
            color: on ? "#fff" : "var(--cream)",
            boxShadow: on ? "0 0 0 3px rgba(70,224,85,.12)" : "none",
          }}>
            <span>{n.icon}</span>{n.label}
          </Link>
        );
      })}
    </nav>
  );
}
