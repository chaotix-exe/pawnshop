"use client";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const GREEN = "#46e055", RED = "#e23b3b", GOLD = "#f0c43c", LINE = "#2e3a29", MUTED = "#93a088";
const PIE = ["#46e055", "#f0c43c", "#3aa0e0", "#e2843b", "#b06be0", "#e23b3b", "#5fd0c0", "#9aa088"];
const eur = (n: number) => "€" + Math.round(n).toLocaleString("nl-NL");

function Box({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="panel" style={{ margin: 0 }}>
      <h3 style={{ fontSize: 15, color: "var(--gold)", margin: "0 0 12px" }}>{title}</h3>
      <div style={{ width: "100%", height: 280 }}>{children}</div>
    </div>
  );
}
const tip = { background: "#10140f", border: "1px solid " + LINE, borderRadius: 8, color: "#f3f0e6" };

export default function DashCharts({ timeline, topItems, catData, hasData }:
  { timeline: any[]; topItems: any[]; catData: any[]; hasData: boolean }) {
  if (!hasData) return <div className="panel"><p className="muted" style={{ margin: 0 }}>Nog geen data — zodra je transacties registreert in de Kassa verschijnen hier grafieken. 📈</p></div>;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }} className="dash-grid">
      <div style={{ gridColumn: "1 / -1" }}>
        <Box title="Omzet & marge over tijd">
          <ResponsiveContainer>
            <LineChart data={timeline} margin={{ top: 6, right: 14, left: -8, bottom: 0 }}>
              <CartesianGrid stroke={LINE} strokeDasharray="3 3" />
              <XAxis dataKey="datum" stroke={MUTED} fontSize={12} />
              <YAxis stroke={MUTED} fontSize={12} />
              <Tooltip contentStyle={tip} formatter={(v: any) => eur(Number(v))} />
              <Legend />
              <Line type="monotone" dataKey="Verkoop" stroke={GREEN} strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="Inkoop" stroke={RED} strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="Marge" stroke={GOLD} strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </div>
      <Box title="Top verkochte items (aantal)">
        <ResponsiveContainer>
          <BarChart data={topItems} layout="vertical" margin={{ top: 4, right: 16, left: 10, bottom: 0 }}>
            <CartesianGrid stroke={LINE} strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" stroke={MUTED} fontSize={12} />
            <YAxis type="category" dataKey="name" stroke={MUTED} fontSize={11} width={110} />
            <Tooltip contentStyle={tip} cursor={{ fill: "rgba(70,224,85,.08)" }} />
            <Bar dataKey="aantal" fill={GREEN} radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Box>
      <Box title="Omzet per categorie">
        <ResponsiveContainer>
          <PieChart>
            <Pie data={catData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={95} paddingAngle={2}>
              {catData.map((_, i) => <Cell key={i} fill={PIE[i % PIE.length]} stroke="#10140f" strokeWidth={2} />)}
            </Pie>
            <Tooltip contentStyle={tip} formatter={(v: any) => eur(Number(v))} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </Box>
      <style>{`@media(max-width:760px){.dash-grid{grid-template-columns:1fr !important}}`}</style>
    </div>
  );
}
