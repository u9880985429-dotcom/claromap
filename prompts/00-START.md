# 🚀 START-PROMPT für Claude Code

> **Anweisung:** Diesen kompletten Prompt bei Claude Code einfügen wenn du das Projekt startest.

---

Hi Claude. Ich starte ein neues Projekt: **Claromap** — ein visuelles Lebens- und Business-Mapping-Tool für DACH.

## Was ich von dir brauche

1. **Lies zuerst die `CLAUDE.md`** im Projekt-Root vollständig durch.
2. **Lies dann den HTML-Prototyp** unter `prototypes/claromap_v7.html` — er zeigt dir wie das fertige Tool aussehen und sich anfühlen soll. Bitte öffne die Datei und überfliege Funktionen wie: Drag/Drop, Resize, Color-Picker, Smiley-Picker, Detail-Panel, AI-Chat-Widget unten rechts.
3. **Bestätige mir kurz** was du verstanden hast (3-5 Sätze max).
4. **Frage mich** welche Phase wir starten sollen.

## Phasen-Übersicht

```
Phase 1 — Setup           (prompts/01-setup.md)
Phase 2 — Auth            (prompts/02-auth.md)
Phase 3 — Datenbank       (prompts/03-database.md)
Phase 4 — Canvas          (prompts/04-canvas.md)        ← Herzstück
Phase 5 — Detail-Panel    (prompts/05-detail-panel.md)
Phase 6 — Andere Views    (prompts/06-views.md)
Phase 7 — KI-Service      (prompts/07-ai-service.md)
Phase 8 — Stripe          (prompts/08-stripe.md)
Phase 9 — Launch          (prompts/09-launch.md)
```

**Empfohlene Reihenfolge:** 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9.

## Wichtige Regeln

- **Niemals viel auf einmal bauen.** Eine Phase nach der anderen.
- **Bei Unsicherheit fragen** statt raten.
- **Vor jedem größeren Schritt** zeig mir den Plan — ich gebe Go.
- **Konventionelle Commits** auf Englisch.
- **Tests** für kritische Logik (KI-Service, Stripe-Webhooks, Auth).

## Zusätzliche Specs

Wenn du Details brauchst, sind diese in `specs/`:
- `data-model.md` — Vollständiges DB-Schema
- `ai-pricing.md` — Kosten pro KI-Modell und Plan
- `design-tokens.md` — Alle CSS-Variablen
- `views.md` — Spec aller 5 Ansichten

---

**Bestätige bitte dass du `CLAUDE.md` und `prototypes/claromap_v7.html` gelesen hast und welche Phase wir als erstes anpacken sollen.**
