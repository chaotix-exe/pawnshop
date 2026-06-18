import { requireUser } from "@/lib/auth";
import { listPromo, uploadPromo } from "@/app/actions/promo";
import PromoGrid from "./PromoGrid";

export const dynamic = "force-dynamic";

export default async function PromoPage() {
  await requireUser();
  const items = await listPromo();
  return (
    <div>
      <h2 className="page">Promomateriaal</h2>
      <div className="panel">
        <h3 style={{ fontSize: 15, color: "var(--gold)", margin: "0 0 4px" }}>Nieuwe afbeelding uploaden</h3>
        <p style={{ color: "var(--muted)", fontSize: 13, margin: "0 0 12px" }}>
          Upload posters, openingstijden of "We're open"-beelden. Het team kan ze hier kopiëren en op Birdy plaatsen.
        </p>
        <form action={uploadPromo}>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
            <div style={{ flex: 1, minWidth: 180 }}><label>Label (optioneel)</label><input name="label" placeholder="bv. openingstijden-weekend" /></div>
            <div style={{ flex: 1, minWidth: 180 }}><label>Afbeelding</label><input name="file" type="file" accept="image/*" required /></div>
            <button className="btn">⬆ Uploaden</button>
          </div>
        </form>
      </div>
      <PromoGrid items={items} />
    </div>
  );
}
