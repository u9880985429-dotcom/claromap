# Phase 6: Andere Ansichten (Mind Map / Linear / Kanban / Liste)

> Voraussetzung: Workflow-View + Detail-Panel funktionieren.

## Aufgabe

4 weitere Ansichten umsetzen, alle mit denselben Daten aus mapStore.

## Komponenten

### `components/canvas/views/MindMapView.tsx`
- Zentraler Knoten (DATA[0]) groß in der Mitte
- Branches radial außenrum, gleichmäßig verteilt
- Bezier-Linien vom Center zu Branches
- Klick auf Knoten öffnet Detail-Panel
- Pan/Zoom funktioniert (gleicher Controller wie Workflow)

### `components/canvas/views/LinearView.tsx`
- Vertikale Liste mit großen Step-Nummern (Kreise)
- Verbindungslinie links (vertikal) zwischen Items
- Card pro Item: Emoji + Name + Status + Description + Progress
- Detail-Level "simple" versteckt Description

### `components/canvas/views/KanbanView.tsx`
- 4 Spalten: Erledigt / In Arbeit / Achtung / Geplant
- Cards gruppiert nach status
- Card zeigt: Step-Nummer, Emoji, Name, kurze Description, Progress-Bar
- Drag-Drop zwischen Spalten ändert status (Phase 8 — vorerst nur display)

### `components/canvas/views/ListView.tsx`
- Tabelle: # | Eintrag | Status | Fortschritt | Termin
- Sortierbar nach Klick auf Header
- Click auf Row öffnet Detail-Panel
- Detail-Level "simple" zeigt weniger Spalten

## View-Switcher in Topbar

```tsx
<button onClick={() => setView('graph')}>⬡ Workflow</button>
<button onClick={() => setView('mindmap')}>✦ Mind Map</button>
<button onClick={() => setView('linear')}>📋 Linear</button>
<button onClick={() => setView('kanban')}>⊞ Kanban</button>
<button onClick={() => setView('list')}>≡ Liste</button>
```

## Detail-Level-Switcher

```tsx
<button onClick={() => setDetailLevel('simple')}>Einfach</button>
<button onClick={() => setDetailLevel('normal')}>Normal</button>
<button onClick={() => setDetailLevel('full')}>Ausführlich</button>
```

Wirkt sich auf ALLE Views aus (welche Felder gezeigt werden).

## Verifikation

- ✅ Alle 5 Views umschaltbar ohne Reload
- ✅ Daten sind konsistent (gleiche Knoten, gleicher Status)
- ✅ Click auf jeden Knoten öffnet Detail-Panel
- ✅ Detail-Level filtert Felder in jeder View
- ✅ Mind Map: Branches korrekt radial verteilt
- ✅ Linear: Step-Nummern groß und visuell stark
- ✅ Kanban: Korrekt nach status gruppiert
- ✅ Liste: Sortierung funktioniert
