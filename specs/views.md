# Views — Spec aller 5 Ansichten

## 1. Workflow View (Standard)

**Komponente:** `WorkflowView.tsx`

**Beschreibung:** Frei positionierbare Knoten auf unbegrenztem Canvas mit nummerierten Verbindungslinien.

**Features:**
- Pan + Zoom (Wheel/Pinch)
- Drag jedes Knotens
- Resize via 4 Eck-Handles
- Verbindungen mit Pfeil + nummeriertem Label ("Schritt 1", "Schritt 2")
- Knoten-Auswahl mit Outline + Resize-Handles sichtbar
- Live-Update der Verbindungen beim Drag

**Use Cases:** Projektpläne, Mind-Maps mit komplexen Beziehungen, Customer Journeys.

---

## 2. Mind Map View

**Komponente:** `MindMapView.tsx`

**Beschreibung:** Zentraler Knoten mit radial angeordneten Branches.

**Layout:**
- DATA[0] = Center (groß, ~180px)
- Restliche Knoten radial verteilt um Center
- Bezier-Kurven vom Center zu jeder Branch
- Pan + Zoom funktioniert
- Knoten in dieser Ansicht sind kleinere Pillen (kein voller Drag/Resize)

**Use Cases:** Brainstorming, Themen-Übersicht, "Was alles zu meinem Studium gehört".

---

## 3. Linear View

**Komponente:** `LinearView.tsx`

**Beschreibung:** Vertikale Liste der Knoten in Reihenfolge der Step-Numbers.

**Layout:**
- Großer Step-Number-Kreis links (48px, farbig nach status)
- Verbindungslinie vertikal zwischen Items
- Card pro Item mit:
  - Emoji + Name + Status-Smiley (oben)
  - Beschreibung (im "Normal"+ Detail-Level)
  - Progress-Bar + %-Wert (unten)

**Use Cases:** "Wie geht das Schritt für Schritt?", To-Do-Listen, Tagesablauf.

---

## 4. Kanban View

**Komponente:** `KanbanView.tsx`

**Beschreibung:** 4 Spalten nach Status gruppiert.

**Spalten:**
- ✅ Erledigt (grün)
- ⏳ In Arbeit (orange)
- ⚠️ Achtung (amber)
- 🌱 Geplant (grau)

**Card-Inhalt:**
- Step-Nummer oben rechts
- Emoji + Name
- Kurze Beschreibung (im "Normal"+)
- Progress-Bar

**Drag-Drop:** Zwischen Spalten ändert status (erst Phase 8 implementieren).

**Use Cases:** Wer-macht-was, Sprint-Planning, Familien-To-Do.

---

## 5. List View

**Komponente:** `ListView.tsx`

**Beschreibung:** Tabellen-Ansicht für maximale Übersicht.

**Spalten:**
- # (Step-Number als farbiger Kreis)
- Eintrag (Emoji + Name + Short-Desc)
- Status (Smiley)
- Fortschritt (Progress-Bar + %)
- Termin (wenn vorhanden)

**Features:**
- Sortierbar nach Klick auf Header
- Filter über Suchleiste oben
- Click auf Row öffnet Detail-Panel
- Im "Simple" Detail-Level: weniger Spalten

**Use Cases:** Power-User, große Maps, Export-Vorschau, Reporting.

---

## Detail-Level-Switcher

Wirkt sich auf ALLE Views aus:

### Simple
- Workflow: nur Emoji + Name (keine Schritt-Nummer, keine Status-Pille)
- Linear: nur Name + Progress
- Kanban: nur Emoji + Name + Progress
- List: nur # + Eintrag + Status + Fortschritt
- Mind Map: nur Center + Branch-Namen

### Normal (Standard)
- Alle Standard-Felder sichtbar
- Beschreibungen gekürzt

### Full (Ausführlich)
- Alle Felder sichtbar
- Vollständige Beschreibungen
- Tags, Tools, Verbindungs-Liste
- Erweiterte Aktionen im Detail-Panel (Löschen, Export, Verlauf)

---

## View-Wechsel

```typescript
function setView(name: ViewName) {
  uiStore.setView(name)
  closeDetailPanel()
  // Re-render automatisch via Zustand-Subscription
}
```

Alle Views nutzen denselben `mapStore` als Datenquelle. Daten sind 100% konsistent zwischen Views.
