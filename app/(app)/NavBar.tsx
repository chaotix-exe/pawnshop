"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/", label: "Dashboard", icon: "📊" },
  { href: "/kassa", label: "Kassa", icon: "💵" },
  { href: "/craft", label: "Craften", icon: "🛠️" },
  { href: "/todo", label: "To-do", icon: "📋" },
  { href: "/historie", label: "Historie", icon: "📁" },
  { href: "/promo", label: "Promo", icon: "🖼️" },
  { href: "/info", label: "Over", icon: "ℹ️" },
];

export default function NavBar({ isAdmin }: { isAdmin: boolean }) {
  const path = usePathname();
  const all = isAdmin ? [...items, { href: "/admin", label: "Admin", icon: "⚙️" }] : items;
  return (
    <nav className="topnav">
      {all.map(n => {
        const on = n.href === "/" ? path === "/" : path.startsWith(n.href);
        return (
          <Link key={n.href} href={n.href} className={"toptab" + (on ? " active" : "")}>
            <span className="ic">{n.icon}</span>{n.label}
          </Link>
        );
      })}
    </nav>
  );
}
