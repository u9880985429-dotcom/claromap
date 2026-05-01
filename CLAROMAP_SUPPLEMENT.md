# 📚 CLAROMAP — Supplementary Reference (ERGÄNZUNG)

> **WICHTIG:** Diese Datei ist eine **ERGÄNZUNG** zu `CLAUDE.md` und den `prompts/` und `specs/` Dateien.  
> Sie LÖSCHT oder ÜBERSCHREIBT keinen bestehenden Inhalt.  
> Sie dokumentiert vollständig alles was im Konzept-Prozess entwickelt wurde — inklusive Details, Iterationen und Varianten die in den Haupt-Prompts möglicherweise nicht enthalten sind.  
> **Bei Lücken oder Unklarheiten in der Umsetzung: hier nachschlagen.**

---

## INHALTSVERZEICHNIS

1. [Konzept & Vision (Ergänzungen)](#1-konzept--vision-ergänzungen)
2. [Vollständige Feature-Liste (Iteration 1, 2, 3)](#2-vollständige-feature-liste)
3. [Alle Layouts & Visualisierungen](#3-alle-layouts--visualisierungen)
4. [Ausgearbeitete Prototyp-Varianten (V1-V7)](#4-prototyp-varianten-v1-v7)
5. [Detaillierte UI-Komponenten](#5-detaillierte-ui-komponenten)
6. [KI-Modell-Details (April 2026)](#6-ki-modell-details)
7. [Pricing-Modell — alle 4 Versionen](#7-pricing-modell-iterationen)
8. [Conversion & Wachstums-Annahmen](#8-conversion--wachstums-annahmen)
9. [DACH-spezifische Details](#9-dach-spezifische-details)
10. [Marketing-Kanäle](#10-marketing-kanäle)
11. [Erweiterte Sicherheits-Anforderungen](#11-erweiterte-sicherheits-anforderungen)
12. [Performance-Benchmarks](#12-performance-benchmarks)
13. [Zukunfts-Roadmap](#13-zukunfts-roadmap)

---

## 1. KONZEPT & VISION (ERGÄNZUNGEN)

### 1.1 Naming-Geschichte (für Branding-Konsistenz)

Die Namensfindung verlief über mehrere Stationen:
1. **"Nexus"** — verworfen (zu generisch, viele Konkurrenten)
2. **"Structmap"** — verworfen (zu technisch, "Struct" kalt)
3. **"Claromap"** — final ✅
   - "Claro" = Klarheit, hell, deutlich (lateinisch/spanisch/italienisch)
   - "Map" = Karte, universell verständlich
   - International aussprechbar
   - Kurz (8 Buchstaben)
   - Domain `.com` und `.io` beide verfügbar

### 1.2 Erweiterte Zielgruppen-Profile

Über die in CLAUDE.md erwähnten 5 Zielgruppen hinaus wurden folgende **Personas** ausgearbeitet:

**Privatnutzer "Maria, 34, Mutter von 2 Kindern"**
- Use Case: Familien-Termine, Geburtstage, Schul-Aktivitäten visualisieren
- Schmerzpunkt: Notion zu kompliziert, Apple Notes zu unstrukturiert
- Bereit zu zahlen: $7-16/Monat

**Studierender "Lukas, 22, Maschinenbau-Master"**
- Use Case: Semesterplan, Lerngruppen, Bachelor-Thesis
- Schmerzpunkt: Excel + Calendar + Notion alle gleichzeitig
- Bereit zu zahlen: $7/Monat (Studi-Rabatt erwünscht)

**Selbstständige "Anna, 41, Yoga-Studio-Inhaberin"**
- Use Case: Kunden-Übersicht, Kurs-Planung, Marketing-Kalender
- Schmerzpunkt: Keine Tech-Affinität, will alles in einem
- Bereit zu zahlen: $16/Monat

**KMU-Geschäftsführer "Klaus, 55, Bauunternehmen mit 12 MA"**
- Use Case: Projekt-Übersicht, Team-Auslastung, Subunternehmer
- Schmerzpunkt: Komplizierte Tools sind zu viel für ältere MA
- Bereit zu zahlen: $39-149/Monat

**Senior "Helga, 71, Rentnerin"**
- Use Case: Einkaufslisten, Arzttermine, Geburtstage der Familie
- Schmerzpunkt: Apps zu klein, Touch-Targets zu klein, zu viele Optionen
- Bereit zu zahlen: $0-7/Monat (oder von Familie bezahlt)

### 1.3 Brand-Tagline-Varianten

Die finale Tagline ist **"Warm für die Omi, stark für den CEO."** Backup-Varianten falls A/B-Test:
- "Visuelle Klarheit für jeden Gedanken."
- "Zeichne deine Welt — verständlich, schön, vernetzt."
- "Von der Idee bis zum Ziel — auf einer Map."

---

## 2. VOLLSTÄNDIGE FEATURE-LISTE

### 2.1 Iteration 1 — MVP-Features (in CLAUDE.md genannt)

Bereits dokumentiert in `CLAUDE.md`. Hier nochmal kompakt:
- 5 Ansichten umschaltbar
- 3 Detail-Level
- Drag & Drop + Resize
- Status-System mit 6 Smileys
- Color-Picker
- 3 Themes
- KI-Chat unten rechts

### 2.2 Iteration 1 — Power-Features (NEU dokumentiert)

Diese Features wurden im Konzept ausgearbeitet aber stehen möglicherweise nicht alle in CLAUDE.md:

**Conditional Highlighting** (von Power BI inspiriert)
- Regeln wie "alle Knoten mit progress < 30% bekommen roten Rand"
- Regeln mit AND/OR Verknüpfung
- Live-Update wenn sich Daten ändern
- UI: Settings-Panel → "Highlighting-Regeln"

**Focus Mode**
- Ein Knoten wird ausgewählt, alle nicht-verbundenen werden ausgegraut
- Zeigt nur den "Pfad" zu diesem Knoten
- Hotkey: `F` auf ausgewähltem Knoten

**Health Score** (Map-Gesundheits-Indikator)
- Berechnung: Durchschnittlicher Fortschritt aller Knoten
- Anzeige als Pille oben rechts in der Topbar
- Farbcode: <30% rot, 30-70% orange, >70% grün
- Klickbar → öffnet Health-Detail-Modal mit Empfehlungen

**Annotations / Post-its**
- Klebezettel können auf Knoten geheftet werden
- Pro Knoten beliebig viele
- Mit User-Zuordnung (für Teams)
- Versionsverlauf pro Annotation

**Translytical** (Power-BI-Konzept übernommen)
- Direkt in der Map editieren wirkt sich auf Datenquelle aus
- Beispiel: Knoten-Status auf "done" setzen → schreibt zurück in DB
- Bidirektional, nicht nur read-only

### 2.3 Iteration 2 — Erweiterte Features

Nach MVP geplant (Phase 9+):
- **Bulk-Aktionen** — Mehrere Knoten gleichzeitig ändern
- **CSV-Import** — Aus Excel/Google Sheets importieren
- **Public Share Links** — Map als Read-Only veröffentlichen mit Token
- **Snapshots / Versionierung** — Map zu jedem Zeitpunkt wiederherstellen
- **Embed Widget** — Map in andere Webseiten einbetten (iframe)

### 2.4 Iteration 3 — Premium Power-Features

Langfristig (12+ Monate):
- **3D-Ansicht** (siehe Sektion 3.6 unten)
- **VR/AR-Mode** (Vision Pro / Quest)
- **Voice-Input** für Knoten-Erstellung
- **Collaborative Cursors** (wie Figma)
- **Time-Machine** — Map zu jedem historischen Zeitpunkt visualisieren
- **AI-Auto-Layout** — Map automatisch optimal anordnen lassen

---

## 3. ALLE LAYOUTS & VISUALISIERUNGEN

> Dies ist der **wichtigste Abschnitt** für die Visualisierungs-Dokumentation. Im Konzept-Prozess wurden viele Darstellungsarten ausgearbeitet — hier ist die vollständige Liste.

### 3.1 Workflow-Layout (Standard, Iteration 1)

**Bezeichnung:** "Graph View" oder "Workflow View"  
**2D-Variante:** ✅ Implementiert in `claromap_v7.html`  
**Beschreibung:**
- Frei positionierbare Knoten auf unbegrenztem Canvas
- Pan + Zoom über Wheel/Pinch
- Drag & Drop für jeden Knoten
- Resize via 4 Eck-Handles
- Verbindungen mit Pfeil + nummeriertem Label

**Use Cases:**
- Projektpläne mit komplexen Abhängigkeiten
- Customer Journeys
- Prozess-Visualisierungen
- Familien-Stammbäume
- Wissens-Maps

### 3.2 Mind Map Layout (Iteration 1)

**Bezeichnung:** "Mind Map View"  
**2D-Variante:** ✅ Implementiert  
**Beschreibung:**
- Zentraler Knoten groß in der Mitte (~180px)
- Branches radial außenrum, gleichmäßig verteilt (Winkel = 2π / count)
- Bezier-Kurven (nicht gerade Linien) vom Center zu Branches
- Branch-Knoten kleiner als Center

**Optionale Erweiterungen** (nicht im Prototyp):
- **Sub-Branches** — 2. Ebene radial um Branches
- **Color-Coded-Branches** — alle Sub-Knoten erben Farbe der Branch
- **Auto-Layout** — bei vielen Knoten algorithmisch optimal verteilen

### 3.3 Linear Layout

**Bezeichnung:** "Linear View" oder "Step-by-Step"  
**2D-Variante:** ✅ Implementiert  
**Beschreibung:**
- Vertikale Liste in Reihenfolge der Step-Numbers
- Großer Step-Number-Kreis links (48px, farbig nach Status)
- Verbindungslinie vertikal zwischen Items
- Card pro Item mit Emoji + Name + Status + Description + Progress

**Use Cases:**
- "Wie geht das Schritt für Schritt?"
- To-Do-Listen
- Tagesablauf
- Rezepte
- Lern-Tutorials

### 3.4 Kanban Layout

**Bezeichnung:** "Kanban View"  
**2D-Variante:** ✅ Implementiert  
**Beschreibung:**
- 4 Spalten gruppiert nach Status:
  - ✅ Erledigt (grün)
  - ⏳ In Arbeit (orange)
  - ⚠️ Achtung (amber)
  - 🌱 Geplant (grau)
- Card pro Knoten mit allen wichtigen Infos
- Drag-Drop zwischen Spalten ändert Status (Phase 8)

**Use Cases:**
- Wer-macht-was im Team
- Sprint-Planning
- Familien-To-Do
- Hausaufgaben-Status

### 3.5 List Layout

**Bezeichnung:** "List View" oder "Table View"  
**2D-Variante:** ✅ Implementiert  
**Beschreibung:**
- Tabelle mit Spalten: # | Eintrag | Status | Fortschritt | Termin
- Sortierbar nach Klick auf Header
- Filter-Suche oben
- Click auf Row öffnet Detail-Panel

**Use Cases:**
- Power-User
- Große Maps mit 50+ Knoten
- Reporting / Export
- Buchhaltungs-Übersicht

### 3.6 3D-Ansichten (Konzept, Iteration 3)

> ⚠️ **Diese Ansichten sind im Konzept ausgearbeitet aber NICHT im aktuellen Prototyp implementiert.** Sie sind für Iteration 3 vorgesehen.

**3D-Variante 1: "Spherical Galaxy"**
- Knoten als Planeten in 3D-Sphäre angeordnet
- Zentral = wichtigster Knoten
- Verbindungen als leuchtende Linien
- Rotation per Maus möglich
- WebGL via Three.js

**3D-Variante 2: "Layered Hierarchy"**
- Knoten in Ebenen geschichtet (wie Floors eines Gebäudes)
- Phase 1 unten, Phase 5 oben
- Vertikale Ebenenwechsel = Phasenwechsel
- Tilt-View ähnlich Google Earth

**3D-Variante 3: "Time Cube"**
- Z-Achse = Zeit
- Knoten erscheinen entlang Z-Axis je nach Erstellung
- Snapshot-Modus zeigt Map zu beliebigem Zeitpunkt
- Navigation per Slider

**Tech-Stack für 3D:**
- Three.js (WebGL)
- React Three Fiber als React-Wrapper
- Drei (Helpers für R3F)
- Performance-Limit: ~500 Knoten in 3D

### 3.7 Spezial-Layouts (Iteration 2-3)

**Funnel View**
- Knoten als trichterförmige Stages
- Conversion-Rate zwischen Stages anzeigen
- Use Case: Sales-Pipeline, User-Acquisition

**Timeline View**
- Horizontale Zeitachse
- Knoten an Datum positioniert
- Phasen als horizontale Bänder
- Use Case: Projekt-Timeline, Lebenslauf, Geschichte

**Org Chart View**
- Klassischer Top-Down Hierarchie-Baum
- Use Case: Firmen-Organigramme, Familienstammbaum

**Galerie View**
- Kacheln mit Knoten als Bilder
- Visueller Mood-Board-Stil
- Use Case: Inspirations-Sammlung, Vision-Boards

**Radar Chart View**
- Knoten in radialer Karte
- Dimensionen als Achsen (z.B. Wichtigkeit, Dringlichkeit)
- Use Case: Prioritäten-Matrix, SWOT-Analyse

**Sankey View**
- Knoten als Flow mit Mengen-Visualisierung
- Use Case: Budget-Aufteilung, Energiefluss

### 3.8 Excalidraw-Style "Hand-Drawn" Theme

**Bezeichnung:** Hand-Drawn / Sketchy Theme  
**2D-Variante:** ✅ Implementiert in `claromap_v7.html`  
**Tech-Detail:**
- SVG `<filter>` mit `feTurbulence` + `feDisplacementMap` für sketchy Effekt
- Schriften: `Caveat`, `Kalam`, `Patrick Hand` (Google Fonts)
- Knoten leicht rotiert (`--rotation: -1deg` mit Variationen)
- Border-Radius asymmetrisch (`60% 65% 55% 60%`)

```css
filter: url(#sketchy);
/* mit SVG: */
<filter id="sketchy">
  <feTurbulence type="fractalNoise" baseFrequency="0.025" numOctaves="2" />
  <feDisplacementMap in="SourceGraphic" scale="2.5" />
</filter>
```

### 3.9 Background-Pattern-Varianten

Im Settings-Panel auswählbar:
- **Dots** — radialer Gradient-Punkt jedes 24px
- **Grid** — vertikale + horizontale Linien jedes 24px
- **Lines** — nur horizontale Linien (Notebook-Stil)
- **Cross** — diagonal kreuzende Linien (Hatch-Pattern)
- **None** — komplett glatt

---

## 4. PROTOTYP-VARIANTEN (V1-V7)

> Iterations-Geschichte für Verständnis der Entwicklung.

### V1 — "Nexus Network Map"
- Erste Idee: einfache Network-Map mit unverbundenen Knoten
- **Verworfen:** zu abstrakt, kein Workflow-Konzept

### V2 — "Mit Detail-Panel"
- Pan/Zoom hinzugefügt
- Rechtsklick öffnet Kontext-Menü
- **Verbessert:** aber immer noch unklar was man tun soll

### V3 — "Multi-Layout"
- 5 Ansichten parallel renderbar
- **Verworfen:** zu überladen, unfokussiert

### V4 — "Design-System"
- 4 Themes eingeführt
- CSS-Variablen-Tokens etabliert
- **Beibehalten:** Theme-System wurde Standard

### V5 — "Iteration-1 Features"
- Funnel + Timeline View hinzugefügt
- 10 Power-Features integriert
- **Verbessert:** zu viel auf einmal, schwer zu erfassen

### V6 — "Workflow Final" (Step-Numbers)
- Schritt-Nummern auf jedem Knoten eingeführt
- Nummerierte Verbindungslinien
- Smiley-System für Status
- **Problem:** zu spezifisch als "Projekt-Workflow" betitelt

### V7 — "Universal Editable Map" (FINAL)
- Generic Demo-Daten (Idee → Planung → Umsetzung → Hindernis → Ziel)
- Voll editierbar: Drag, Resize, Color-Picker, Smiley-Picker
- Nicht mehr als "Projekt-Workflow" betitelt
- KI-Chat-Widget unten rechts hinzugefügt
- **Status:** Aktueller Stand, Referenz-Prototyp

### Lessons Learned aus V1-V7

1. **Generizität vor Spezifität** — Ein Beispiel sollte für viele Use Cases passen
2. **Sofortige Editierbarkeit** — User wollen direkt herumprobieren können
3. **Live-Updates** — Verbindungen müssen während Drag mitlaufen, nicht nach Drag-End
4. **Auto-Status** — Status sollte sich aus Progress automatisch ergeben
5. **Picker statt Dropdown** — Color/Smiley als Floating-Picker, nicht als Select
6. **Nummerierte Schritte** — Wichtigstes Element für Workflow-Verständnis
7. **KI immer sichtbar** — Floating Action Button unten rechts, nie versteckt

---

## 5. DETAILLIERTE UI-KOMPONENTEN

### 5.1 Topbar (54px hoch)

**Linke Sektion:**
- Logo (32px Mark + Schriftzug)
- Vertikaler Divider

**Mittlere Sektion:**
- View-Switcher (5 Buttons mit Icons)
- Vertikaler Divider
- Detail-Level-Switcher (3 Buttons: Einfach/Normal/Ausführlich)

**Rechte Sektion:**
- "+ Neu" Button (Knoten erstellen)
- "🎨 Design" Button (öffnet Settings-Panel links)
- "⌂" Reset-Button (zentriert View)

### 5.2 Stats-Strip (oben links unter Topbar)

4 Pills mit Live-Counts:
- ✅ Erledigt (grün)
- ⏳ In Arbeit (orange)
- ⚠️ Achtung (amber)
- 🌱 Geplant (grau)

### 5.3 Settings-Panel (links, slide-in)

**Sektionen:**
1. **Theme** — 3 Cards: Hell / Dunkel / Hand
2. **Background-Farbe** — Color-Picker + Hex-Input + 8 Voreinstellungs-Swatches
3. **Background-Pattern** — 4 Cards: Dots / Grid / Lines / Keine
4. **Knoten-Beschriftung** — 3 Toggles:
   - Labels außen statt innen
   - Schritt-Nummern anzeigen
   - Status-Smiley anzeigen

### 5.4 Detail-Panel (rechts, slide-in, 440px breit)

**Header:**
- Step-Pille (orange) mit "SCHRITT N"
- Status-Pille (klickbar → Smiley-Picker)
- Emoji-Icon (klickbar → Emoji-Picker)
- Name (contenteditable)
- Short-Description (contenteditable)
- Close-Button (✕)

**Body-Sektionen** (gefiltert nach Detail-Level):
1. **Beschreibung** (contenteditable, autogrow)
2. **Fortschritt** (Progress-Bar + Slider 0-100%)
3. **Knoten anpassen:**
   - Hintergrundfarbe (18 Swatches + Picker + Hex)
   - Textfarbe (Picker + Hex)
   - Form (5 Optionen)
   - Größe (2 Slider: Breite + Höhe)
4. **Aufgaben** (Checkboxes, mit Auto-Progress-Recalc) — ab "Normal"
5. **Erweitert** (Löschen-Button) — nur "Ausführlich"

### 5.5 KI-Chat-Widget (unten rechts)

> ⚠️ **VERALTET (2026-05-01):** KI-Chat wird NICHT gebaut. Memory-Entscheidung „keine KI im Produkt". Siehe Anhang 17.1. Die folgende Spec ist nur noch historische Referenz.


**Geschlossener Zustand:**
- 56×56px Floating Action Button
- Gold-Gradient Background
- 🤖 Emoji
- Pulsing Glow Animation

**Geöffneter Zustand:**
- 380×520px Window
- Header mit Avatar + Status (grüner Punkt)
- Body mit Nachrichten-Stream
- Suggestions-Pills
- Input mit Send-Button
- Footer-Note: "🔌 KI-INTEGRATION FOLGT ÜBER CLAUDE CODE"

**Mock-Antworten** (für Demo):
- 4 vordefinierte Antworten rotieren
- Echte Anbindung folgt in Phase 7

### 5.6 Zoom-Controls (rechts, über AI-Chat)

3 Buttons (34×34px):
- ＋ (Zoom in)
- － (Zoom out)
- ⌂ (Reset)

### 5.7 Welcome-Overlay (beim ersten Öffnen)

- Backdrop Blur
- Box mit Gradient-Top-Border (Gold + Blue + Purple)
- Titel + Sub
- 6 Feature-Cards (2×3 Grid)
- "✨ Map öffnen" Button

### 5.8 Floating Pickers

**Smiley-Picker:**
- Position: am Cursor (event.clientX/Y + 10)
- 240px breit
- 8-Spalten-Grid mit 20 Smileys
- Schließt sich bei Click außerhalb

**Emoji-Picker:**
- Position: am Cursor
- 280px breit
- 8-Spalten-Grid mit 40+ Emojis
- Scrollbar wenn überfüllt

---

## 6. KI-MODELL-DETAILS

> ⚠️ **VERALTET (2026-05-01):** Komplette Sektion ist hinfällig. Keine KI im Produkt — siehe Anhang 17.1. Preise + Routing-Logik bleiben hier nur als historische Dokumentation stehen, falls die Entscheidung jemals wieder gekippt wird.

> Detaillierte Preise und Routing-Logik (Stand April 2026, korrigierte Werte).

### 6.1 Modell-Preise (KORRIGIERT — wichtig!)

| Modell | Input ($/Mtok) | Output ($/Mtok) | Free Tier |
|---|---|---|---|
| Claude Haiku 4.5 | **$1.00** | **$5.00** | Nein |
| Claude Sonnet 4.6 | $3.00 | $15.00 | Nein |
| Gemini 2.5 Flash | $0.10 | $0.40 | Nein |
| Gemini 2.5 Flash-Lite | $0 | $0 | **1.000 Anfragen/Tag** |
| FLUX.1 dev (HF) | — | $0.0012/Bild | Nein |
| Nano Banana | — | $0.039/Bild | **500 Bilder/Tag** |

⚠️ **WICHTIG:** Haiku ist NICHT $0.80/$4 wie ältere Berechnungen. Aktuell **$1/$5**.

### 6.2 Empfohlenes Routing pro Plan

**Free:**
- Standard: Gemini Flash-Lite (kostenlos)
- Bei Limit-Überschreitung: Sperrung mit Hinweis "Upgrade auf Starter"

**Starter ($7):**
- Standard: Claude Haiku
- Limit: 200 Anfragen/Tag, $3 Cost/Monat

**Pro ($16):**
- Standard: Claude Haiku
- Bilder: FLUX.1 (3× P2S/Monat als Preview-Feature)
- Limit: 500 Anfragen/Tag, $8 Cost/Monat

**Team ($39):**
- Standard: 80% Haiku, 20% Sonnet (basierend auf Prompt-Länge >500 Tokens → Sonnet)
- P2S: 30× pro Monat mit Sonnet
- Bilder: FLUX.1 unbegrenzt

**Enterprise ($149):**
- Standard: Sonnet
- Optional: Eigener API-Key (User zahlt selbst)
- Keine Limits

### 6.3 Kosten-Beispiele

**Standard-Chat (300 in / 600 out tokens):**
- Mit Haiku: ($1 × 0.0003) + ($5 × 0.0006) = **$0.0033/Anfrage**
- Mit Sonnet: ($3 × 0.0003) + ($15 × 0.0006) = **$0.0099/Anfrage**

**P2S — Prompt-to-Structure (500 in / 1500 out):**
- Mit Sonnet (P2S braucht Qualität): **$0.024/Generierung**

**Weekly Review (1000 in / 800 out):**
- Mit Haiku: **$0.005/Review**

### 6.4 Limit-Enforcement-Logik

```typescript
const LIMITS = {
  free:       { reqPerDay: 50,    costPerMo: 0.50 },
  starter:    { reqPerDay: 200,   costPerMo: 3 },
  pro:        { reqPerDay: 500,   costPerMo: 8 },
  team:       { reqPerDay: 1000,  costPerMo: 20 },
  enterprise: { reqPerDay: Infinity, costPerMo: Infinity }
}
```

Bei Überschreitung:
- Soft-Limit (80%): Warnung im UI
- Hard-Limit (100%): Block mit Upgrade-CTA

---

## 7. PRICING-MODELL ITERATIONEN

> ⚠️ **TEILWEISE VERALTET (2026-05-01):** Die Marge-Berechnungen unten basieren auf KI-Kosten, die wir nicht haben. Ohne KI sind die Margen pro Plan höher (kaum variable Kosten außer Hosting + Storage). Wenn die Pricing-Phase wieder aktiv wird, müssen die Zahlen neu kalkuliert werden — ohne KI-Spalte.


### V1 (verworfen)
Erste Berechnung war zu pessimistisch — Free-User-Kosten mit $2/Monat veranschlagt (falsch, real ~$0.05).

### V2 (verworfen)
Ohne Sonnet-Cap → Marge wäre bei Heavy-Usern auf <50% gefallen.

### V3 (verworfen)
P2S nicht eingerechnet → unrealistisch.

### V4 (FINAL — Kohorten-Modell) ✅

| Plan | Preis | KI-Kosten | Infra | Marge |
|---|---|---|---|---|
| Free | $0 | $0 | $0.05 | n/a |
| Starter | $7 | $0.33 | $0.50 | 88% |
| Pro | $16 | $1.08 | $1 | 87% |
| Team | $39 | $5.36 | $3 | 79% |
| Enterprise | $149 | $99* | $10 | 27% |

*Enterprise: Wenn eigener Key dann höhere Marge.

**Kohorten-Skalierung:**
- 100 User: $496 MRR / 75% Marge
- 1.000: $5.000 MRR / 78% Marge
- 10.000: $50.000 MRR / 84% Marge
- 100.000: $500.000 MRR / 87% Marge

**Break-Even:** ~25 Paid-Nutzer.

---

## 8. CONVERSION & WACHSTUMS-ANNAHMEN

### 8.1 Conversion-Rates

- **Free → Paid (organisch):** 14%
- **Free → Paid (mit 14-Tage Pro-Trial):** 22% (+8% Trial-Effekt)
- **Trial Opt-out-Rate:** 30% (sehr gut für SaaS, Industrie-Standard 40-50%)

### 8.2 Plan-Verteilung (Kohorten-Annahme)

- 60% Free
- 25% Starter
- 10% Pro
- 4% Team
- 1% Enterprise

### 8.3 ARPU (Average Revenue Per User)

Bei dieser Verteilung:
- ARPU paid: $13.40
- ARPU all (inkl. Free): $5.40

### 8.4 Churn-Annahmen

- Monthly Churn paid: 5% (Industrie-Standard für Productivity-SaaS)
- Annual Churn: 35-40%
- LTV bei 5% Churn: $268 (20 Monate × $13.40)
- CAC-Ziel: <$67 (LTV/CAC = 4:1)

---

## 9. DACH-SPEZIFISCHE DETAILS

### 9.1 DSGVO-Compliance (Pflicht)

**Daten-Handling:**
- Alle User-Daten in **Supabase Frankfurt (eu-central-1)**
- Keine US-Region erlaubt
- Auftragsverarbeitungsvertrag (AVV) mit Supabase nötig
- AVV mit Anthropic/Google/HuggingFace nötig

**Cookies:**
- Nur essentielle Cookies ohne Consent
- Plausible Analytics (cookie-frei) — kein Banner nötig
- Stripe-Cookies → im Cookie-Banner deklarieren

**User-Rechte:**
- Auskunft (Art. 15 DSGVO) — via Settings
- Löschung (Art. 17 DSGVO) — vollständig binnen 30 Tagen
- Datenübertragbarkeit (Art. 20 DSGVO) — JSON-Export
- Widerspruch (Art. 21 DSGVO) — opt-out

### 9.2 Impressums-Pflicht (DE/AT/CH)

**Pflicht-Angaben** auf `app/(marketing)/imprint/page.tsx`:
- Name + Anschrift des Verantwortlichen
- Kontakt (E-Mail, Telefon)
- Handelsregister-Nr. (wenn UG/GmbH)
- Umsatzsteuer-ID
- Verantwortlicher i.S.v. § 18 Abs. 2 MStV (für Inhalte)

### 9.3 Sprache & Lokalisierung

**Standard-Sprache:** Deutsch (DE-DE)
**Datumsformat:** DD.MM.YYYY
**Währung:** EUR primär (oder USD international), Komma als Dezimaltrennzeichen
**Wochenanfang:** Montag

**Spätere Sprachen:**
- DE-AT (Österreichisch — kleine Anpassungen wie "Jänner")
- DE-CH (Schweizerdeutsch — kleine Anpassungen, kein ß)
- EN (Englisch international, Phase 10+)

### 9.4 Bezahlmethoden

Stripe-Konfiguration für DACH:
- ✅ Kreditkarte (Visa, Mastercard, Amex)
- ✅ SEPA-Lastschrift (DACH-Pflicht!)
- ✅ Sofortüberweisung
- ✅ giropay (Deutschland)
- ✅ EPS (Österreich)
- ✅ TWINT (Schweiz, später)
- ✅ Apple Pay / Google Pay
- ❌ PayPal (Stripe unterstützt nicht direkt — Phase 2 mit eigener Integration)

### 9.5 Rechtliche Texte (Pflicht)

- **Impressum** (DE: TMG, AT: ECG, CH: freiwillig aber empfohlen)
- **Datenschutzerklärung** (DSGVO-konform)
- **AGB** (Allgemeine Geschäftsbedingungen)
- **Widerrufsbelehrung** (für Verbraucher!)
- **Kündigungsbutton** (DE-Pflicht seit 1.7.2022 für Online-Verträge)

---

## 10. MARKETING-KANÄLE

### 10.1 DACH-spezifische Kanäle

**Newsletter:**
- t3n (deutsches Tech-Magazin)
- OMR (Online Marketing Rockstars)
- Indie Mafia DACH
- The Hustle DE

**Communities:**
- LinkedIn DACH (sehr aktiv für B2B)
- XING (kleinere Reichweite, aber DACH-Fokus)
- Reddit r/de_EDV, r/Notion (Vergleich)

**Podcast:**
- t3n Podcast
- Doppelgänger Tech Talk
- OMR Podcast

### 10.2 Internationale Kanäle

- Product Hunt (Tuesday-Launch für max. Reach)
- Indie Hackers (Build-in-Public Story)
- Hacker News (Show HN: Posts)
- Reddit r/SaaS, r/InternetIsBeautiful
- Twitter/X Tech-Community

### 10.3 Content-Marketing-Themen

**Blog-Topics für SEO:**
- "Wie organisiere ich mein Familienleben digital?"
- "Vom Notion-Chaos zur visuellen Klarheit"
- "Mind-Mapping für Selbstständige"
- "Studienorganisation für Erstis"
- "DSGVO-konforme Notion-Alternative für Deutschland"

**Vergleichs-Artikel:**
- Claromap vs. Notion
- Claromap vs. Miro
- Claromap vs. Excalidraw
- Claromap vs. XMind

---

## 11. ERWEITERTE SICHERHEITS-ANFORDERUNGEN

### 11.1 Authentication

- **Password-Anforderungen:** min. 12 Zeichen, kein bekanntes Passwort (haveibeenpwned API)
- **2FA-Support:** TOTP (Google Authenticator, Authy)
- **Magic Links:** 15 Minuten gültig, single-use
  - ⚠️ **VERALTET (2026-05-01):** Magic-Link wird NICHT gebaut. Max-Begründung: bringt nur Supportaufwand wenn User den Link in der Mail nicht findet. Login = E-Mail+Passwort + Google OAuth. Siehe Memory `feedback_keine_magic_link.md` und Anhang 17.1.
- **Session-Management:** 30 Tage Cookie, refresh on activity

### 11.2 Rate-Limiting

```
Auth-Endpoints:    5 Versuche / 15 Minuten / IP
API-Endpoints:     100 / Minute / User
AI-Endpoints:      siehe Plan-Limits
Public-Endpoints:  20 / Minute / IP
```

Implementierung über Supabase Edge Functions oder Vercel Edge Middleware.

### 11.3 Content-Security-Policy

```
default-src 'self';
script-src 'self' 'unsafe-inline' https://js.stripe.com https://plausible.io;
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
img-src 'self' https: data:;
font-src 'self' https://fonts.gstatic.com;
connect-src 'self' https://*.supabase.co wss://*.supabase.co
            https://api.anthropic.com https://generativelanguage.googleapis.com
            https://api-inference.huggingface.co https://api.stripe.com;
```

### 11.4 Logging & Monitoring

- Sentry für Error-Tracking (Source-Maps in Production)
- Vercel Analytics für Performance
- Supabase-Logs für DB-Slow-Queries
- Stripe-Dashboard für Payment-Events
- Custom-Logging in `ai_history` für KI-Usage

---

## 12. PERFORMANCE-BENCHMARKS

### 12.1 Lighthouse-Ziele

- **Landing-Page:** Score >95 (Performance + SEO + Accessibility)
- **Dashboard:** Score >85
- **Map-Editor:** Score >75 (durch Canvas-Komplexität niedriger)

### 12.2 Canvas-Performance

- 30 Knoten: 60fps konstant (Pflicht)
- 100 Knoten: 60fps (Soll)
- 500 Knoten: >30fps (Mit Virtualisierung)
- 1000 Knoten: nur Listen-View empfohlen

### 12.3 Bundle-Size-Ziele

- Initial JS: <200KB gzipped
- Lazy-Loaded Modules: dynamisch (Three.js erst bei 3D-View)
- CSS: <50KB gzipped
- Fonts: WOFF2, subset auf Latin

### 12.4 Database-Performance

- Map-Load: <500ms (incl. Knoten + Connections)
- Knoten-Update: <100ms
- AI-Response: <3s P50, <8s P99

---

## 13. ZUKUNFTS-ROADMAP

### Phase A (Monate 1-2): MVP
Siehe Phase 1-9 in `prompts/`.

### Phase B (Monate 3-6): Iteration 2
- Bulk-Aktionen
- CSV-Import
- Public Share Links
- Snapshots
- Embed Widget
- Funnel + Timeline View

### Phase C (Monate 7-12): Iteration 3
- 3D-Ansichten (Spherical Galaxy, Layered, Time Cube)
- Voice-Input
- Collaborative Cursors
- Advanced AI: Auto-Layout, Smart-Suggestions

### Phase D (Jahr 2): Internationalisierung
- Englisch (UK + US)
- Französisch
- Spanisch
- Italienisch
- Erweiterte Markets: Niederlande, Skandinavien

### Phase E (Jahr 2-3): Mobile Apps
- iOS Native App (Swift)
- Android Native App (Kotlin)
- Offline-Mode mit Sync
- Apple Pencil / Stylus Support

### Phase F (Jahr 3+): Enterprise & B2B
- White-Label-Option
- API für Drittanbieter
- Marketplace für Templates
- VR/AR-Mode (Vision Pro, Quest)
- Custom Domain für Public-Maps

---

## 14. TECHNICAL DEBT & BEKANNTE LIMITS

Stand April 2026:

### Im Prototyp (V7) bekannte Lücken:
- Keine Persistierung (alles in-memory)
- Keine Multi-User-Sync
- Mind-Map-View ist nicht editierbar (nur Read-Only-Display)
- 3D-Views sind nur Konzept, nicht implementiert
- Touch-Support ist rudimentär (Pinch-Zoom + Single-Drag funktioniert, Multi-Touch noch nicht)

### Nach MVP zu adressieren:
- Virtualisierung für >100 Knoten
- Realtime-Sync (Supabase Channels)
- Offline-Mode mit IndexedDB
- Service Worker für PWA
- Conflict-Resolution bei gleichzeitigen Edits

---

## 15. DATEI-INDEX

Alle Dokumentations-Dateien im Überblick:

```
claromap-app/
├── CLAUDE.md                    ← Master-Instruktion (Pflichtlektüre)
├── README.md                    ← Quick Start
├── CLAROMAP_SUPPLEMENT.md       ← DIESE DATEI (Ergänzungen)
│
├── prompts/
│   ├── 00-START.md              ← Erster Prompt für Claude Code
│   ├── 01-setup.md              ← Phase 1: Next.js + Tailwind
│   ├── 02-auth.md               ← Phase 2: Supabase Auth
│   ├── 03-database.md           ← Phase 3: DB-Schema + RLS
│   ├── 04-canvas.md             ← Phase 4: Canvas (Herzstück)
│   ├── 05-detail-panel.md       ← Phase 5: Detail-Panel
│   ├── 06-views.md              ← Phase 6: Andere Views
│   ├── 07-ai-service.md         ← Phase 7: KI-Integration
│   ├── 08-stripe.md             ← Phase 8: Payments
│   └── 09-launch.md             ← Phase 9: Launch
│
├── specs/
│   ├── data-model.md            ← Detailliertes DB-Schema
│   ├── ai-pricing.md            ← Kosten-Berechnungen
│   ├── design-tokens.md         ← CSS-Variablen + Tailwind-Config
│   └── views.md                 ← Spec aller 5 Ansichten
│
└── prototypes/
    └── claromap_v7.html         ← Funktionaler UI-Prototyp
```

---

## 16. WIE DIESE DATEI ZU NUTZEN

**Wenn du in der Umsetzung bist und etwas fehlt:**

1. Suche zuerst in `CLAUDE.md` (Master)
2. Schau in den entsprechenden `prompts/0X-xxx.md` (Phase-spezifisch)
3. Schau in `specs/` (technische Details)
4. Wenn dann immer noch etwas fehlt → **DIESE DATEI**

**Diese Datei enthält:**
- Personas und detaillierte Zielgruppen-Profile
- Naming-Geschichte und Brand-Tagline-Varianten
- Vollständige Iterations-Liste der Features (Iter 1, 2, 3)
- ALLE ausgearbeiteten Layouts inkl. 2D + 3D-Konzepte
- Alle Prototyp-Versionen V1-V7 mit Lessons Learned
- Detaillierte UI-Komponenten-Specs
- Korrigierte KI-Modell-Preise (April 2026)
- Pricing-Iterations-Geschichte
- Conversion-Rates und Wachstums-Annahmen
- DACH-spezifische Compliance-Details
- Marketing-Kanäle für DACH + International
- Erweiterte Sicherheits-Anforderungen
- Performance-Benchmarks und Bundle-Size-Ziele
- Vollständige Zukunfts-Roadmap (Phase A-F)
- Technical Debt und bekannte Limitierungen

**Wichtig:**
- Diese Datei ist **AKTUALISIERBAR** — wenn du im Verlauf neue Erkenntnisse gewinnst, ergänze hier
- Diese Datei **ÜBERSCHREIBT NICHTS** in CLAUDE.md
- Bei Konflikten gilt: **CLAUDE.md hat Vorrang**, diese Datei ist Ergänzung

---

**Letzte Aktualisierung:** Diese Datei wurde initial erstellt am Tag der ersten Claude-Code-Setup. Bei jeder Erweiterung der Konzept-Phase hier ergänzen, niemals löschen.

---

## 17. UMSETZUNGS-STAND & ABWEICHUNGEN VOM URSPRÜNGLICHEN KONZEPT

> **Ergänzt am 2026-05-01** — nach den ersten Self-Use-Iterationen mit Max.
> Dieser Abschnitt ergänzt das Supplement, **löscht oder überschreibt nichts** weiter oben.
> Bei Widersprüchen zwischen oberem Konzept und diesem Abschnitt gilt: **dieser Abschnitt ist der aktuelle Stand**.

### 17.1 Strategie-Verschiebungen seit Konzept-Erstellung

Im Verlauf der Implementierung hat Max drei strategische Entscheidungen getroffen, die mehrere Sektionen oben überholen:

**A) Self-Use-First statt Markt-First**
- Max möchte Claromap zuerst SELBST produktiv nutzen, um seine eigenen laufenden Projekte (FamPrio, qontroly, Faceless YT, Claromap selbst) zu strukturieren. Erst danach kommen Markt-Features wie Pricing, Marketing und Stripe.
- Phasen-Reihenfolge geändert von linear (1→2→…→9) auf:
  - **Priorität 1 (Self-Use):** Phase 1 Setup → 2 Auth → 3 DB → 4 Canvas → 5 Detail-Panel → 6 Views
  - **Priorität 2 (Markt):** Phase 8 Stripe → 9 Launch
  - **Priorität 3 (App-Mantel):** PWA-Layer (manifest.json, Service Worker, Mobile-Layouts) — NACH Marktstart
- Konsequenz: Sektion 7 (Pricing) und Sektion 9.4 (Bezahlmethoden) sind aktuell **eingefroren**, nicht gestrichen.

**B) Keine KI im Code oder Marketing — endgültig**
- Memory-Eintrag `feedback_keine_ki.md` (2026-05-01): KEINE KI/AI-Features (Anthropic, OpenAI, Gemini, FLUX etc.) — weder im Code noch in der Vermarktung.
- Konsequenz: **Phase 7 (KI-Service) entfällt komplett**. Auch der KI-Chat-FAB (Sektion 5.5) wird NICHT gebaut.
- Sektion 6 (KI-Modell-Details) und Sektion 17 (Pricing-Marge mit KI-Kosten) sind damit **historisch dokumentiert, aber nicht mehr aktiv geplant**.
- Der DB-Tabellen-Eintrag `ai_history` bleibt als Schema-Leiche bestehen, wird aber nie geschrieben.

**C) Kein Magic-Link**
- Memory-Eintrag `feedback_keine_magic_link.md`: nur E-Mail + Passwort + Google OAuth.
- Konsequenz: Sektion 11.1 ("Magic Links: 15 Minuten gültig, single-use") ist **gestrichen** in der Praxis. In Phase 2 wurde nur E-Mail+Passwort+Google implementiert.

### 17.2 Tatsächlich umgesetzte Phasen (Stand 2026-05-01)

| Phase | Status | Anmerkung |
|---|---|---|
| 1 Setup | ✅ | Next.js 16.2.4 (statt 15) + Tailwind 4 + pnpm + alle Core-Deps |
| 2 Auth | ✅ | E-Mail + Passwort + Google. **Kein Magic-Link.** |
| 3 DB | ✅ | 9 Tabellen, RLS aktiv, Triggers, Helper-Functions, 6 Migrationen |
| 4 Canvas | ✅ | Drag, Resize, Pan, Zoom, Connect, Auto-Save, Inline-Edit |
| 5 Detail-Panel | ✅ | Alle Pickers (Emoji, Color, Status, Shape, Tasks) + Inline-Edit + Connection-Edit + Map-Settings |
| 6 Views | ✅ + **Bonus** | 5 ursprüngliche Views + 3 neue (siehe 17.3) |
| 7 KI-Service | ❌ | **Gestrichen** (siehe 17.1 B) |
| 8 Stripe | ⏸ | Eingefroren bis nach Self-Use |
| 9 Launch / Marketing | ⏸ | Eingefroren bis nach Self-Use |

### 17.3 Bonus-Features die nicht im ursprünglichen Konzept standen

Im Verlauf sind durch Inspirations-Bilder und Iterationen folgende Erweiterungen entstanden:

**Neue Views (jetzt 8 statt 5):**
- **Hub-View** ◎ — Donut-Layout, Center umgeben von Sektoren (Power-BI-Fabric-Inspiration)
- **Timeline-View** ⟿ — Horizontale Roadmap mit Monatsspalten + Bars (braucht `start_date`/`end_date` an nodes — Migration `005_node_dates`)
- **Swimlane-View** ⫶ — Horizontale Lanes nach Verantwortlichkeit (braucht `lane` Spalte — Migration `006_node_hierarchy_lane_diamond`)

**Neue Knoten-Form:**
- **Diamond / Raute** — für Entscheidungs-Knoten in Flowcharts (Migration `006`)

**Parent-Sub-Hierarchie:**
- `nodes.parent_node_id` Spalte — selbst-referenzierender FK
- Wirkt sich aktuell in Timeline-View aus (eingerückte Bars mit ↳-Marker)
- Verhindert Zyklen (Selektor filtert direkte Kinder als mögliche Parents aus)

**Bezier-Kurven für Connections:**
- Statt geraden Linien jetzt sanft geschwungene Pfade (Inspiration: organische Mind-Maps)

**Hand-Drawn-Theme komplett:**
- 45°-Schraffur-Background (Inspiration: selfhostedServiceNetwork-Diagramm)
- Knoten kriegen automatisch reduzierte Saturation + dashed Border + 2px Pseudo-3D-Schatten
- Pastell-Reihe im ColorPicker dazu (mindmaster "Know yourself"-Inspiration)

### 17.4 Lücken aus Konzept die NOCH offen sind (sortiert nach Priorität)

**Quick-Wins die jetzt geschlossen werden (Sprint 2026-05-01):**
- ✅ Background-Pattern **"Cross"** als 5. Option (Sektion 3.9 Hatch-Pattern) → in MapSettings + globals.css
- ✅ **Health-Score-Pille** im Map-Header (Sektion 2.2) → avg(progress), Farbcode rot/orange/grün
- ✅ **Focus-Mode** (Sektion 2.2) → Hotkey `F` auf selektiertem Knoten, dimmt nicht-verbundene Knoten

**Mittlere Lücken — wenn Max Priorität setzt:**
- **Annotations / Post-its-UI** — DB-Tabelle `annotations` existiert seit Phase 3, aber kein UI
- **Conditional Highlighting** (Sektion 2.2) — Regel-System mit AND/OR-Verknüpfung
- **Bulk-Aktionen** (Sektion 2.3) — mehrere Knoten gleichzeitig ändern
- **Stats-Strip** (Sektion 5.2) — 4 Live-Counts oben links unter Topbar
- **Welcome-Overlay** beim ersten Öffnen (Sektion 5.7)

**Größere Iterationen — später:**
- **CSV-Import** (Sektion 2.3)
- **Public Share Links** + **Snapshots** + **Embed Widget** (Sektion 2.3)
- **Funnel View** + **Org Chart View** + **Galerie View** + **Radar Chart View** + **Sankey View** (Sektion 3.7)
- **3D-Views** (Sektion 3.6) — Iteration 3, langfristig
- **Versionsverlauf pro Annotation**

### 17.5 Tech-Stack-Anpassungen vs. Konzept

| Konzept-Stand | Tatsächlich | Grund |
|---|---|---|
| Next.js 15 | Next.js 16.2.4 | Auto-Update, kompatibel |
| `middleware.ts` | `proxy.ts` | Next.js 16 hat Konvention umbenannt |
| Tailwind 3 Config | Tailwind 4 mit `@theme inline` in CSS | v4-Standard, keine `tailwind.config.ts` mehr nötig |
| `tailwind.config.ts` | `globals.css` mit `@theme inline` | siehe oben |
| Local-First-Option erwähnt | **Cloud Free Tier von Supabase** | Max wollte sofort produktiv ohne Docker, Auto-Pause nach 7 Tagen Inaktivität ist akzeptabel |

### 17.6 Aktuelle DB-Schema-Erweiterungen (über das Supplement hinaus)

Migration-History:
1. `001_initial_schema` — 9 Basis-Tabellen + Trigger
2. `002_rls_policies` — Row-Level-Security auf allen Tabellen
3. `003_function_security_hardening` — search_path + REVOKE auf handle_new_user
4. `004_fix_rls_recursion` — `is_team_member()` und `is_team_owner()` Helper-Functions
5. `005_node_dates` — `nodes.start_date` + `nodes.end_date` (für Timeline-View)
6. `006_node_hierarchy_lane_diamond` — `nodes.parent_node_id` + `nodes.lane` + Shape-CHECK um `'diamond'` erweitert

### 17.7 Memory-System (für zukünftige Sessions)

Folgende Memories sind aktuell aktiv und beeinflussen die Implementierung:
- `feedback_keine_ki.md` — KEINE KI/AI in Code oder Marketing
- `feedback_keine_magic_link.md` — nur E-Mail+Passwort+Google
- `feedback_einfache_sprache.md` — Schreibe so einfach, dass ein 6-Jähriger es versteht
- `feedback_arbeitsweise.md` — Autonom arbeiten, mehrere Phasen am Stück, wenig Rückfragen
- `feedback_projekt_grenzen.md` — Pro Session nur EIN Projekt anfassen
- `feedback_bilderverarbeitung.md` — Bilder in `_input/` nach Verarbeitung in `_verwendet/`, `_unused/` oder `angesehen/` einsortieren
- `project_claromap.md` — Projekt-Memory mit Supabase-Projekt-ID, Phasen-Reihenfolge, Self-Use-First-Strategie

### 17.8 Offene Fragen an Max

Folgende Punkte aus dem ursprünglichen Konzept sollten geklärt werden:

1. ~~**KI-Sektion** im Supplement (Sektionen 6, 7 mit KI-Kosten, 5.5 KI-Chat) — soll sie als **"historisch / nicht mehr aktiv"** markiert werden?~~ ✅ **Erledigt 2026-05-01:** Sektionen 5.5, 6 und 7 mit ⚠️ Veraltet-Marker oben in der Sektion versehen. Inhalt unverändert für historische Referenz.
2. ~~**Magic Links** in Sektion 11.1 — soll der Eintrag durchgestrichen oder mit „⚠️ Veraltet" markiert werden?~~ ✅ **Erledigt 2026-05-01:** Markierung in 11.1 ergänzt. Begründung: User-Support-Aufwand wenn Mail nicht findbar.
3. ~~**3D-Views** (Sektion 3.6) — Konzept-Eis, aber Memory besagt "App-Mantel später". 3D nach App-Mantel? Oder ganz streichen?~~ ✅ **Entschieden 2026-05-01: 3D wird AKTIV gebaut.** Max: „Es sollte auch in 3d sichtbar und nutzbar sein." → 3D-View wird implementiert mit Three.js + react-three-fiber. Status: in Arbeit, siehe Anhang 17.3 Bonus-Features.
4. **Plan-Verteilung in Sektion 8.2** (60% Free, 25% Starter, etc.) — basiert auf 5 Tarifen. Ohne KI ist die Tarif-Differenzierung anders. Aktualisieren wenn Pricing-Phase aktiv wird.

