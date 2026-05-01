# Claromap — Project Instructions

> Diese Datei wird von Claude Code bei jeder Interaktion automatisch gelesen.

## Was ist Claromap?

Claromap ist ein **visuelles Lebens- und Business-Mapping-Tool** für DACH (Deutschland, Österreich, Schweiz). Es hilft Menschen — von der Oma bis zum CEO — ihre Ideen, Projekte, Lebensbereiche und Workflows visuell zu organisieren.

**Kern-Versprechen:** "Warm für die Omi, stark für den CEO."

**Domains:** claromap.com (primär) + claromap.io (backup)
**Sprachen:** Deutsch primär, Englisch international später

## Zielgruppen (alle gleichberechtigt)

1. Privatnutzer:innen — Familien-Organisation, persönliche Ziele
2. Studierende — Studienorganisation, Lernpläne
3. Selbstständige — Projekt-Übersicht, Kunden-Maps
4. KMU — Business-Workflows, Team-Maps
5. Senioren — Einfache Lebens-Maps, Termine

**UI muss für ALLE funktionieren.** Keine Tech-Sprache. Keine Annahmen.

## Core Features (MVP)

- Knoten erstellen mit Emoji, Name, Beschreibung, Farbe, Form, Größe
- Knoten verbinden mit nummerierten Verbindungslinien (Schritt 1, 2, 3...)
- 5 Ansichten umschaltbar: Workflow / Mind Map / Linear / Kanban / Liste
- 3 Detail-Level: Einfach / Normal / Ausführlich
- Drag & Drop für alle Knoten
- Resize per Maus mit 4 Eck-Handles
- Status-System mit Smileys: ✅ ⏳ 🌱 ⚠️ 🚀 🔒
- Fortschritt 0-100% mit Slider und Auto-Status
- Inline-Edit für alle Texte (contenteditable)
- Color-Picker für jeden Knoten (Hintergrund + Textfarbe + Hex)
- Background frei wählbar (Color-Picker + Pattern: Dots/Grid/Lines/None)
- 3 Themes: Hell / Dunkel / Hand-Drawn (Excalidraw-Style)
- KI-Chat unten rechts (Floating Action Button, immer sichtbar)

## Tech-Stack (zwingend)

- Framework: Next.js 15 (App Router, Server Components)
- Sprache: TypeScript (strict mode)
- Styling: Tailwind CSS 4 + CSS Variables für Theming
- State: Zustand (lightweight)
- Database: Supabase (PostgreSQL + Realtime + Auth) — **Frankfurt Region**
- Auth: Supabase Auth (E-Mail + Google + Magic Link)
- Payments: Stripe (5 Tarife + 14-Tage-Trial)
- KI: Anthropic SDK + Google AI SDK + Hugging Face FLUX.1
- Hosting: Vercel (EU)
- Storage: Supabase Storage
- Analytics: Plausible (DSGVO-konform, kein Cookie)

## Datenmodell

```sql
maps (id, user_id, team_id NULL, title, background_color, background_pattern, theme)
nodes (id, map_id, step_number, emoji, name, short_desc, description, color, text_color, shape, width, height, position_x, position_y, status, status_icon, progress)
connections (id, map_id, from_node_id, to_node_id, step_label, number, color, line_style)
tasks (id, node_id, text, done, order_index)
ai_history (id, user_id, feature, model, prompt, response, tokens_used, cost_usd)
subscriptions (id, user_id, plan, stripe_sub_id, trial_ends_at, status)
```

Row-Level-Security (RLS) immer aktiv. Frankfurt-Region zwingend.

## KI-Integration

Eine zentrale `lib/ai/aiService.ts`:

```typescript
async function aiRequest(
  feature: 'chat'|'p2s'|'review'|'summary'|'task-suggest'|'image',
  prompt: string,
  context: { mapId?: string; nodeId?: string; userPlan: string; userId: string },
  modelOverride?: 'haiku'|'sonnet'|'gemini-flash'|'gemini-lite'|'flux1'
): Promise<{ text: string; tokensUsed: number; costUsd: number }>;
```

**Modell-Routing pro Plan:**
- Free: Gemini Flash-Lite (kostenlos)
- Starter ($7): Claude Haiku ($1/$5 Mtok)
- Pro ($16): Haiku + 3× P2S/Mo
- Team ($39): Haiku 80% + Sonnet 20% + 30× P2S/Mo
- Enterprise ($149): Sonnet oder eigener Key

**Bilder:**
- Free Pool: Nano Banana (500/Tag kostenlos)
- Pro+: FLUX.1 via Hugging Face ($0.0012/Bild — 30× günstiger als Nano paid)

## Pricing-Modell

| Plan | Preis | Hauptfeatures |
|---|---|---|
| Free | $0 | 1 Map, 20 Knoten |
| Starter | $7/Mo | 3 Maps, 100 Knoten |
| Pro | $16/Mo | ∞ Maps, FLUX.1, 3× P2S |
| Team | $39/Mo | 5 User, Sync, 30× P2S |
| Enterprise | $149/Mo | ∞ User, eigener Key |

14-Tage Opt-out Pro-Trial. Bei Kündigung: Mind-Map-Konvertierung (nicht löschen).

## Projekt-Struktur

```
claromap/
├── app/
│   ├── (auth)/login,signup,callback
│   ├── (dashboard)/maps,settings,billing
│   ├── (marketing)/page.tsx, pricing, about
│   └── api/ai,stripe
├── components/
│   ├── canvas/Canvas, Node, ConnectionLine, DetailPanel, views/*
│   ├── ai/AiChat
│   ├── settings/SettingsPanel
│   └── ui/
├── lib/
│   ├── supabase/{client,server,middleware}.ts
│   ├── ai/aiService.ts + providers/
│   ├── stripe/
│   └── utils/
├── stores/{mapStore,uiStore,aiStore}.ts
├── types/
├── supabase/migrations/
└── prototypes/claromap_v7.html  ← Referenz
```

## Coding Conventions

- TypeScript strict an. Kein `any`.
- Server Components by default, Client Components nur wenn nötig.
- Tailwind first.
- Design-Tokens via CSS Variables. Keine hardcoded Farben.
- Mobile-first responsive.
- Konventionelle Commits auf Englisch (`feat:`, `fix:`).

## Sicherheit & Datenschutz

- DSGVO-Pflicht
- Alle Daten in EU
- Cookies: nur essentielle ohne Consent
- KI-Anfragen: User informieren
- Daten-Export jederzeit als JSON
- Account-Löschung binnen 30 Tagen

## Entwicklungs-Reihenfolge

1. Setup (Next.js + TS + Tailwind)
2. Auth (Supabase)
3. DB-Schema + Migrations
4. Canvas (Workflow-View) + Drag/Resize
5. Detail-Panel + Pickers
6. Andere Views (Mind/Linear/Kanban/List)
7. KI-Service
8. Stripe
9. Marketing + Launch

Iterativ. Eine Phase nach der anderen. Bei Unsicherheit fragen.

## Wichtige Hinweise

- **Referenz-Prototyp:** `prototypes/claromap_v7.html` — schau ihn an, er zeigt EXAKT wie die UI aussehen und sich verhalten soll
- Bei Unsicherheit: User fragen
- Vor jedem größeren Schritt: Plan zeigen, Go abwarten
- Tests: Mindestens aiService, Stripe-Webhooks, Auth-Middleware

**Bestätige nach Lesen kurz was du verstanden hast und welche Phase aktuell ist.**
