import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Miko's Pawn Shop", description: "Administratie" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="nl"><body>{children}</body></html>;
}
