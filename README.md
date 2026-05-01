# 🗺️ Claromap

**Visuelles Lebens- und Business-Mapping-Tool für DACH.**
Warm für die Omi, stark für den CEO.

## Quick Start mit Claude Code

### 1. Voraussetzungen

```bash
# Node.js 20+ und pnpm
node --version  # >= 20
npm install -g pnpm

# Claude Code installieren
npm install -g @anthropic-ai/claude-code
```

### 2. Projekt anlegen

```bash
mkdir claromap && cd claromap

# Diese Dateien hineinkopieren:
# - CLAUDE.md
# - README.md (diese Datei)
# - prompts/ (alle Phasen-Prompts)
# - specs/ (detaillierte Specs)
# - prototypes/claromap_v7.html (UI-Referenz)

# Claude Code starten
claude
```

### 3. Den Start-Prompt eingeben

Den Inhalt von `prompts/00-START.md` in Claude Code einfügen.
Claude wird das Projekt aufsetzen und durch alle Phasen führen.

## Wichtige Dateien

```
claromap-app/
├── CLAUDE.md              ← Master-Instruktionen
├── README.md
├── prompts/
│   ├── 00-START.md        ← Erster Prompt
│   ├── 01-setup.md
│   ├── 02-auth.md
│   ├── 03-database.md
│   ├── 04-canvas.md       ← Herzstück
│   ├── 05-detail-panel.md
│   ├── 06-views.md
│   ├── 07-ai-service.md
│   ├── 08-stripe.md
│   └── 09-launch.md
├── specs/
│   ├── data-model.md
│   ├── ai-pricing.md
│   ├── design-tokens.md
│   └── views.md
└── prototypes/
    └── claromap_v7.html   ← Funktionaler UI-Prototyp
```

## Benötigte Secrets (.env.local)

```bash
# Supabase (Frankfurt!)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Anthropic
ANTHROPIC_API_KEY=sk-ant-...

# Google AI (Gemini Free Tier)
GOOGLE_AI_API_KEY=AIza...

# Hugging Face (FLUX.1)
HUGGINGFACE_API_KEY=hf_...

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_live_...

# Email
RESEND_API_KEY=re_...
```

## Workflow

1. Phase starten: Prompt aus `prompts/0X-xxx.md` einfügen
2. Claude liest `CLAUDE.md`, baut die Phase, fragt bei Unsicherheit
3. Reviewen mit `pnpm dev`
4. Konventionelle Commits (`feat:`, `fix:`)
5. Wenn alles passt: nächste Phase

## MVP-Ziel: 8 Wochen

- ✅ Vollständig funktionales Canvas (alle 5 Views)
- ✅ Auth + Datenbank
- ✅ KI-Chat mit Claude Haiku
- ✅ Stripe (5 Tarife)
- ✅ 14-Tage Pro-Trial
- ✅ Landing-Page

Erst nach MVP: Team-Features, P2S, Snapshots, Embeds.
