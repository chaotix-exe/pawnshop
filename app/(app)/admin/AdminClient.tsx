"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveItem, deleteItem, saveIngredient } from "@/app/actions/data";
import { createEmployee, resetPassword, deleteEmployee, updateProfile } from "@/app/actions/auth";

export default function AdminClient({ items, recipes, users }: { items: any[]; recipes: any[]; users: any[] }) {
  const router = useRouter();
  const [tab, setTab] = useState<"items" | "recepten" | "logins">("items");
  const tabs: [string, string][] = [["items", "Prijzen / items"], ["recepten", "Recepten"], ["logins", "Medewerker-logins"]];
  return (
    <div>
      <h2 style={{ color: "#3ddc4a" }}>Admin</h2>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        {tabs.map(([k, l]) => <button key={k} className={"btn sm" + (tab === k ? "" : " ghost")} onClick={() => setTab(k as any)}>{l}</button>)}
      </div>
      {tab === "items" && <Items items={items} onChange={() => router.refresh()} />}
      {tab === "recepten" && <Recepten recipes={recipes} onChange={() => router.refresh()} />}
      {tab === "logins" && <Logins users={users} onChange={() => router.refresh()} />}
    </div>
  );
}

function Items({ items, onChange }: { items: any[]; onChange: () => void }) {
  const [edit, setEdit] = useState<any>(null);
  async function save(fd: FormData) { const r = await saveItem(null, fd); if (!r?.error) { setEdit(null); onChange(); } else alert(r.error); }
  async function del(fd: FormData) { if (confirm("Verwijderen?")) { await deleteItem(fd); onChange(); } }
  const blank = { id: "", categorie: "", item: "", aankoopprijs: "", verkoopprijs: "", craftkost: "", opmerking: "" };
  return (
    <div>
      <div className="panel">
        <h3 style={{ color: "#f0c43c", fontSize: 14 }}>{edit?.id ? "Item bewerken" : "Nieuw item"}</h3>
        <form action={save}>
          <input type="hidden" name="id" value={edit?.id || ""} />
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 130 }}><label>Categorie</label><input name="categorie" defaultValue={edit?.categorie || ""} /></div>
            <div style={{ flex: 1, minWidth: 130 }}><label>Item</label><input name="item" defaultValue={edit?.item || ""} /></div>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <div><label>Aankoop</label><input name="aankoopprijs" type="number" defaultValue={edit?.aankoopprijs ?? ""} /></div>
            <div><label>Verkoop</label><input name="verkoopprijs" type="number" defaultValue={edit?.verkoopprijs ?? ""} /></div>
            <div><label>Craftkost</label><input name="craftkost" type="number" defaultValue={edit?.craftkost ?? ""} /></div>
          </div>
          <label>Opmerking</label><input name="opmerking" defaultValue={edit?.opmerking || ""} />
          <div style={{ marginTop: 10, display: "flex", gap: 8 }}><button className="btn sm">Opslaan</button>{edit && <button type="button" className="btn ghost sm" onClick={() => setEdit(null)}>Annuleer</button>}</div>
        </form>
      </div>
      <div className="panel">
        <table><thead><tr><th>Cat.</th><th>Item</th><th className="r">Aankoop</th><th className="r">Verkoop</th><th /></tr></thead>
          <tbody>{items.map(i => <tr key={i.id}><td style={{ color: "#9aa593" }}>{i.categorie}</td><td>{i.item}</td><td className="r">{i.aankoopprijs ?? "—"}</td><td className="r">{i.verkoopprijs ?? "—"}</td>
            <td className="r" style={{ whiteSpace: "nowrap" }}><button className="btn ghost sm" onClick={() => setEdit(i)}>✎</button> <form action={del} style={{ display: "inline" }}><input type="hidden" name="id" value={i.id} /><button className="btn red sm">✕</button></form></td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}

function Recepten({ recipes, onChange }: { recipes: any[]; onChange: () => void }) {
  const [sel, setSel] = useState(recipes[0]?.id || "");
  const rec = recipes.find(r => String(r.id) === String(sel));
  async function save(fd: FormData) { const r = await saveIngredient(null, fd); if (!r?.error) onChange(); else alert(r.error); }
  return (
    <div className="panel">
      <label>Recept</label>
      <select value={sel} onChange={e => setSel(e.target.value)}>{recipes.map(r => <option key={r.id} value={r.id}>{r.product} — {r.station}</option>)}</select>
      {rec && <table style={{ marginTop: 10 }}><thead><tr><th>Ingredient</th><th>Aantal</th><th>Eenheid</th><th /></tr></thead>
        <tbody>{rec.recipe_ingredients.map((ing: any) => <tr key={ing.id}><td>{ing.ingredient}</td>
          <td colSpan={3}><form action={save} style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input type="hidden" name="id" value={ing.id} />
            <input name="aantal" type="number" step="0.5" defaultValue={ing.aantal} style={{ width: 90 }} />
            <select name="eenheid" defaultValue={ing.eenheid} style={{ width: 80 }}><option value="x">x</option><option value="%">%</option></select>
            <button className="btn sm">Opslaan</button>
          </form></td></tr>)}</tbody></table>}
    </div>
  );
}

function Logins({ users, onChange }: { users: any[]; onChange: () => void }) {
  const [edit, setEdit] = useState<any>(null);
  async function add(fd: FormData) { const r = await createEmployee(null, fd); if (!r?.error) onChange(); else alert(r.error); }
  async function save(fd: FormData) { const r = await updateProfile(null, fd); if (!r?.error) { setEdit(null); onChange(); } else alert(r.error); }
  async function reset(fd: FormData) { const pw = prompt("Nieuw wachtwoord (min. 6 tekens):"); if (!pw) return; fd.set("password", pw); const r = await resetPassword(null, fd); if (r?.error) alert(r.error); else alert("Wachtwoord gewijzigd."); }
  async function del(fd: FormData) { if (confirm("Medewerker verwijderen?")) { await deleteEmployee(fd); onChange(); } }
  return (
    <div>
      <div className="panel">
        <h3 style={{ color: "var(--gold)", fontSize: 14, margin: "0 0 6px" }}>Nieuwe medewerker</h3>
        <form action={add}>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 120 }}><label>Gebruikersnaam</label><input name="username" /></div>
            <div style={{ flex: 1, minWidth: 120 }}><label>Naam</label><input name="naam" /></div>
            <div style={{ flex: 1, minWidth: 120 }}><label>Functie</label><input name="functie" placeholder="bv. Verkoper" /></div>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 120 }}><label>Wachtwoord</label><input name="password" type="text" /></div>
            <div style={{ width: 150 }}><label>Rol</label><select name="rol"><option value="medewerker">medewerker</option><option value="admin">admin</option></select></div>
            <div style={{ flex: 2, minWidth: 160 }}><label>Foto-URL (optioneel)</label><input name="foto_url" placeholder="https://..." /></div>
          </div>
          <label>Bio (optioneel)</label><textarea name="bio" rows={2} />
          <div style={{ marginTop: 10 }}><button className="btn sm">+ Aanmaken</button></div>
        </form>
      </div>

      {edit && (
        <div className="panel" style={{ borderColor: "var(--green)" }}>
          <h3 style={{ color: "var(--gold)", fontSize: 14, margin: "0 0 6px" }}>Bewerken: {edit.username}</h3>
          <form action={save}>
            <input type="hidden" name="id" value={edit.id} />
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 120 }}><label>Naam</label><input name="naam" defaultValue={edit.naam || ""} /></div>
              <div style={{ flex: 1, minWidth: 120 }}><label>Functie</label><input name="functie" defaultValue={edit.functie || ""} /></div>
              <div style={{ width: 150 }}><label>Rol</label><select name="rol" defaultValue={edit.rol}><option value="medewerker">medewerker</option><option value="admin">admin</option></select></div>
            </div>
            <label>Foto-URL</label><input name="foto_url" defaultValue={edit.foto_url || ""} placeholder="https://..." />
            <label>Bio</label><textarea name="bio" rows={3} defaultValue={edit.bio || ""} />
            <div style={{ marginTop: 10, display: "flex", gap: 8 }}><button className="btn sm">Opslaan</button><button type="button" className="btn ghost sm" onClick={() => setEdit(null)}>Annuleer</button></div>
          </form>
        </div>
      )}

      <div className="panel">
        <table><thead><tr><th>Gebruiker</th><th>Functie</th><th>Rol</th><th /></tr></thead>
          <tbody>{users.map(u => <tr key={u.id}>
            <td><b>{u.naam || u.username}</b><div className="muted" style={{ fontSize: 11 }}>{u.username}</div></td>
            <td className="muted">{u.functie || "—"}</td><td>{u.rol}</td>
            <td className="r" style={{ whiteSpace: "nowrap" }}>
              <button className="btn ghost sm" onClick={() => setEdit(u)}>✎</button>{" "}
              <form action={reset} style={{ display: "inline" }}><input type="hidden" name="id" value={u.id} /><button className="btn ghost sm">🔑</button></form>{" "}
              <form action={del} style={{ display: "inline" }}><input type="hidden" name="id" value={u.id} /><button className="btn red sm">✕</button></form>
            </td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}
