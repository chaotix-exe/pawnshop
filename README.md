# Miko's Pawn Shop — web app (Next.js + Supabase + Vercel)

Kassa, craft-calculator, craft-to-do, dashboard en een adminsectie. Login per medewerker
(gebruikersnaam + wachtwoord), aangemaakt door een admin.

## Architectuur
- **Next.js (App Router)** — UI + server actions, draait op Vercel.
- **Supabase (Postgres)** — database + auth. Alle data-bewerkingen lopen server-side via de
  service-role-sleutel; RLS staat aan zodat de data afgeschermd is.
- **GitHub** — code; Vercel deployt automatisch bij elke push.

Login werkt met gebruikersnamen die intern aan een adres `gebruikersnaam@miko.local` gekoppeld
worden (dat zie je niet, je logt in met naam + wachtwoord).

---

## Stap 1 — Supabase database
1. Maak een project op https://supabase.com.
2. **SQL Editor → New query**: plak en run eerst `supabase_schema_seed.sql`, daarna `supabase_auth.sql`.
   (Beide kreeg je los aangeleverd.) Je tabellen + alle data staan nu klaar.
3. **Project Settings → API**: noteer `Project URL`, de `anon` key en de `service_role` key.

## Stap 2 — Code naar GitHub
1. Maak een lege GitHub-repo (bv. `miko-pawnshop`).
2. Upload de inhoud van deze map, of via terminal:
   ```
   cd miko-pawnshop
   git init && git add . && git commit -m "init"
   git branch -M main
   git remote add origin https://github.com/JOUW/miko-pawnshop.git
   git push -u origin main
   ```

## Stap 3 — Vercel
1. Ga naar https://vercel.com → **Add New → Project** → kies je GitHub-repo.
2. Bij **Environment Variables** zet je (uit stap 1):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`  ← geheim, alleen hier
   - `USERNAME_EMAIL_DOMAIN` = `miko.local`
3. **Deploy**. Je krijgt een URL zoals `https://miko-pawnshop.vercel.app`.

## Stap 4 — Eerste admin aanmaken
1. Open `https://JOUW-URL/setup`.
2. Vul gebruikersnaam, naam en wachtwoord in → de eerste admin wordt aangemaakt.
   (Dit scherm werkt daarna niet meer — er bestaat dan al een gebruiker.)
3. Log in op `/login`. Onder **Admin → Medewerker-logins** maak je de rest van het team aan.

---

## Lokaal draaien (optioneel)
```
npm install
cp .env.local.example .env.local   # vul je Supabase-sleutels in
npm run dev                          # http://localhost:3000
```

## Beheer
- **Prijzen/items & recepten**: Admin-sectie in de app (of de Supabase-tabeleditor). Wijzigingen
  zijn meteen actief.
- **Code aangepast?** Push naar GitHub → Vercel deployt automatisch.

## Let op
- De `service_role`-sleutel geeft volledige toegang. Zet hem alleen in Vercel/`.env.local`,
  nooit in code of in een `NEXT_PUBLIC_`-variabele.
- Richtprijzen in de calculator zijn zo goed als de `aankoopprijs` in de items-tabel.
