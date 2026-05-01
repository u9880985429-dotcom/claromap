# 🚀 Vercel-Deployment-Checkliste

> Schritt-für-Schritt-Anleitung um Claromap auf Vercel zu deployen.

## Vor dem Deploy

### ✅ Lokal verifiziert (Stand letzte Session)
- TypeScript strict — clean
- ESLint — clean
- `pnpm build` (Production-Build) — kompiliert in ~3-4s
- Alle 9 Routes generiert (`/`, `/login`, `/signup`, `/callback`, `/logout`, `/maps`, `/maps/[id]`)
- Keine Console-Errors auf den Hauptrouten
- Alle 9 Views rendern (Workflow, Mind Map, Hub, Linear, Kanban, Liste, Timeline, Swimlane, 3D)
- Alle 23 Vorlagen anlegbar
- Theme-Switching: Default / Hand-Drawn / Dark — alle korrekt
- Auto-Save mit Status-Indicator
- Undo/Redo via Cmd+Z funktional
- JSON-Export funktional

## Deploy-Schritte

### 1. Vercel-Account
- Auf [vercel.com](https://vercel.com) mit **GitHub-Login** anmelden (du hast schon `u9880985429-dotcom`)
- Kostenloser „Hobby"-Tarif reicht für Self-Use

### 2. Projekt importieren
- „Add New… → Project"
- GitHub-Repo `u9880985429-dotcom/claromap` auswählen
- Vercel erkennt automatisch: **Next.js**, Build-Command `next build`, Output `.next`

### 3. **Region: Frankfurt (fra1)** — DSGVO-Pflicht
- Im Project-Setup unter „Region": `Frankfurt – Germany (fra1)` auswählen
- Niemals `iad1` (US) oder andere Nicht-EU-Regionen für DSGVO-Konformität

### 4. Environment Variables eintragen

Drei Werte aus deiner lokalen `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://acwhqgeltlnihbgzifzj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_qVTrdwrYcY1Q--FhL2VrVA_pJAe6ov6
NEXT_PUBLIC_APP_URL=https://<deine-vercel-url>.vercel.app
```

Wichtig:
- `NEXT_PUBLIC_APP_URL` muss die **finale Production-URL** sein (sonst klappen OAuth-Redirects nicht)
- Die ersten beiden Werte sind sicher öffentlich (Publishable-Key, RLS schützt die Daten)
- **Service-Role-Key NICHT eintragen** — wir nutzen ihn nicht, er wäre ein Sicherheitsrisiko

### 5. Build starten
- „Deploy" klicken
- Erste Build-Zeit: ~2-3 Min
- Wenn Build fehlschlägt: Logs in Vercel-Dashboard checken

## Nach erstem Deploy

### 6. Vercel-URL kopieren
Beispiel: `https://claromap-abc123.vercel.app`

### 7. Supabase auf neue URL einstellen

In [Supabase-Dashboard](https://supabase.com/dashboard/project/acwhqgeltlnihbgzifzj):

**Authentication → URL Configuration:**
- **Site URL:** `https://claromap-abc123.vercel.app`
- **Redirect URLs (Allowed):** füge hinzu:
  - `https://claromap-abc123.vercel.app/**`
  - `https://claromap-abc123.vercel.app/callback`

Sonst landet OAuth-Login nach erfolgreichem Auth bei einer „Invalid redirect"-Seite.

### 8. Environment-Variable updaten
Zurück bei Vercel: `NEXT_PUBLIC_APP_URL` auf die echte URL setzen → Re-Deploy.

## Optional: Custom Domain

### 9. Eigene Domain (`claromap.com`)
- Vercel: „Project Settings → Domains → Add"
- Domain eintippen, Vercel zeigt DNS-Einträge an
- Bei deinem Domain-Hoster (Strato/IONOS/etc.) DNS umstellen
- Warte 5-30 Min auf Propagation
- Vercel stellt automatisch Let's-Encrypt-Zertifikat aus

### 10. Supabase URLs noch einmal aktualisieren
Wenn du eine eigene Domain nutzt: Site URL + Redirect URLs nochmal in Supabase ändern.

## Was du NACH dem Deploy testen solltest

1. Öffne die Vercel-URL — Onepager sichtbar
2. „Anmelden" → mit `maxbauer1992@icloud.com` / `123456abc` einloggen
3. Auf `/maps` solltest du deine 7 Maps sehen
4. Eine Map öffnen → Knoten anlegen, draggen, verbinden → muss funktionieren
5. Theme wechseln (Settings → Theme) → muss persistent sein
6. Vorlage einfügen → Modal mit 24 Vorlagen muss erscheinen
7. JSON-Export → Datei muss runterladen
8. Cmd+Z → muss letzten Schritt rückgängig machen

## Bekannte Stolperfallen

### „Invalid redirect URL" beim Login
→ Supabase Allowed Redirect URLs nicht aktualisiert. Siehe Schritt 7.

### „Supabase URL not defined"
→ Environment Variable nicht gesetzt oder deploy nach Variable-Update vergessen. Vercel re-deploy auslösen.

### Maps-Page zeigt 0 Maps trotz vorhandener Daten
→ User-ID-Mismatch. Stelle sicher dass du dich mit `maxbauer1992@icloud.com` eingeloggt hast (das ist der User der die Maps besitzt).

### Build-Error „Module not found: three / @react-three/fiber"
→ pnpm-lock.yaml möglicherweise nicht in git. Check `git ls-files | grep pnpm-lock` — sollte da sein. Wenn nicht: lokal `pnpm install`, dann `pnpm-lock.yaml` committen + pushen.

### Performance: 3D-View braucht ~1-2s zum Laden
→ Normal. Three.js ist ~600KB, wird per `next/dynamic` lazy geladen — der erste Tab-Klick auf `3D` hat eine Latenz. Folgeaufrufe sind cached.

## Was später kommt

Diese Punkte sind aktuell **bewusst nicht** im Deployment:
- Stripe-Integration (Pricing, Subscriptions)
- Marketing-Mailings
- Analytics (Plausible kann später eingebaut werden, ist DSGVO-konform)
- Eigene Mail-Templates auf Deutsch (aktuell nutzt Supabase Default)
- Impressum/Datenschutz/AGB-Seiten (Pflicht spätestens bei Public-Launch)

## Rollback-Plan

Wenn ein Deploy schief geht:
- Vercel → Deployments → vorherigen Deploy → „Promote to Production"
- Sofort wieder live mit altem Stand

GitHub als Single Source of Truth: jede Production-Version ist ein git-Commit. Du kannst jeden Stand der Vergangenheit wiederherstellen.
