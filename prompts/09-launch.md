# Phase 9: Launch-Vorbereitung

> Voraussetzung: Alles funktional.

## Aufgabe

Marketing-Pages + Beta + Production-Deploy.

## Marketing-Pages

### `app/(marketing)/page.tsx` — Landing
- Hero: "Visuelle Map für dein Leben & Business"
- 3 Use-Cases (Privat / Selbstständig / Team)
- Demo-Video (oder interaktiver Prototyp)
- Features-Grid (10 Hauptfeatures)
- Pricing-Teaser
- Testimonials (initial Beta-User)
- CTA: "Kostenlos starten"

### `app/(marketing)/pricing/page.tsx` — Tarife
- Bereits in Phase 8 gebaut
- Erweitern: FAQ, Vergleichs-Tabelle, "Welcher Plan passt zu mir?" Quiz

### `app/(marketing)/about/page.tsx` — Über uns
- DACH-Fokus
- DSGVO-Compliance
- "Warum Claromap?"

### `app/(marketing)/imprint/page.tsx` & `/privacy/page.tsx`
- Impressum (DE-Pflicht)
- Datenschutzerklärung (DSGVO)

## Beta-Phase

1. **Einladungs-System:**
   - `signup?invite=XXX` Codes
   - 50 Codes für Early Adopters
   - In-App "Beta"-Badge

2. **Feedback-Tool:**
   - In-App Widget unten links
   - Eingaben in `feedback` Tabelle
   - Tägliches Slack-Webhook für neue Feedback

3. **Onboarding-Tour** (5 Schritte):
   - Willkommen
   - Erste Map erstellen
   - Knoten hinzufügen
   - Status setzen
   - Mit KI plaudern

4. **Bug-Tracking:**
   - Sentry einbinden
   - Source-Maps für Production

## Production-Deploy

1. **Vercel-Setup:**
   - GitHub-Repo verbinden
   - Auto-Deploy auf `main` → claromap.com
   - Preview-Deploys auf PRs

2. **Custom Domain:**
   - claromap.com → Production
   - claromap.io → Redirect zu .com
   - DNS via Vercel-Nameservers

3. **Environment Variables** in Vercel:
   - Alle Secrets aus `.env.local`
   - Production-Stripe-Keys (live, nicht test)

4. **DSGVO-Compliance-Check:**
   - Cookie-Banner (nur bei nicht-essentiellen)
   - Datenschutzerklärung verlinkt
   - Daten-Export-Funktion testbar
   - Account-Löschung testbar

5. **Performance-Audit:**
   - Lighthouse Score >90 auf Landing
   - Canvas-Performance bei 100 Knoten
   - Image-Optimization (next/image)

6. **Monitoring:**
   - Vercel Analytics
   - Sentry für Errors
   - Supabase-Dashboard für DB-Health
   - Stripe-Dashboard für Subscriptions

## Marketing-Launch

1. **Indie Hackers Post** (Build-in-Public Story)
2. **Product Hunt Launch** (Tuesday-Launch)
3. **DACH-Newsletter:** t3n, OMR, Indie Mafia DACH
4. **Reddit:** r/SaaS, r/Notion (Vergleich)
5. **LinkedIn:** Personal Brand Posts

## Verifikation

- ✅ Landing-Page lädt unter <2s
- ✅ Lighthouse Score >90
- ✅ Stripe-Test-Charge funktioniert
- ✅ Mail-Templates kommen an
- ✅ DSGVO-konform
- ✅ Beta-Codes funktionieren
- ✅ Sentry empfängt Errors
- ✅ Domain claromap.com aktiv
