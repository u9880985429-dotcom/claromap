# Phase 5: Detail-Panel mit voller Editierbarkeit

> Voraussetzung: Canvas funktioniert.

## Aufgabe

Detail-Panel rechts mit allen Edit-Features wie im Prototyp `claromap_v7.html`.

## Komponente: `components/canvas/DetailPanel.tsx`

### Header
- Step-Pille (orange) mit "SCHRITT N"
- Status-Pille (klickbar → öffnet Smiley-Picker)
- Emoji (klickbar → Emoji-Picker)
- Name (contenteditable, inline)
- Short-Description (contenteditable)
- Close-Button

### Body Sections

**1. Beschreibung** (contenteditable, autogrow)

**2. Fortschritt** (Progress-Bar + Slider 0-100%)
- Auto-Update von status: 0=idea, 1-99=wip, 100=done
- Auto-Update von statusIcon: 🌱/⏳/✅

**3. Knoten anpassen:**
- **Hintergrundfarbe:** 18 vorgegebene Farben + Color-Picker + Hex-Input
- **Textfarbe:** Color-Picker + Hex-Input
- **Form:** 5 Optionen (Rund/Soft/Eckig/Scharf/Leaf)
- **Größe:** 2 Slider (Breite + Höhe, 60-300px)

**4. Aufgaben** (im Detail-Level "Normal" und "Ausführlich")
- Liste mit Checkboxes
- Klick toggelt done
- Auto-recalc von progress aus done/total
- "+ Aufgabe hinzufügen" Button

**5. Erweitert** (nur im Detail-Level "Ausführlich")
- "🗑️ Knoten löschen" Button (mit Confirm)

## Komponenten

### `components/settings/SmileyPicker.tsx`
Floating-Picker mit 20 Smileys. Setzt status + statusIcon, schließt sich nach Auswahl.

### `components/settings/EmojiPicker.tsx`
Floating-Picker mit 40+ Emojis in 8-Spalten-Grid.

### `components/settings/ColorPicker.tsx`
- 18 vorgegebene Farben als Swatches
- HTML5 `<input type="color">` für Custom
- Hex-Input für direkten Wert
- Live-Preview im Knoten

### `components/settings/ShapePicker.tsx`
5 Optionen:
- 50% (Rund)
- 20% (Soft)
- 8% (Eckig)
- 0% (Scharf)
- "leaf" (Asymmetrisch: 50% 0 50% 0)

## Update-Functions

Alle Updates sollen:
1. Sofort UI aktualisieren (optimistic)
2. Im mapStore patchen
3. Debounced (500ms) zur DB syncen

```typescript
function updateField(id: string, field: keyof Node, value: any)
function updateProgress(id: string, value: number)
function updateNodeColor(id: string, color: string)
function updateNodeShape(id: string, shape: NodeShape)
function updateNodeSize(id: string, dim: 'width'|'height', value: number)
function toggleTask(id: string, taskIdx: number)
function addTask(id: string)
function deleteNode(id: string)
```

## Detail-Level-Logic

```typescript
- 'simple': Nur Name + Status + Progress + Color
- 'normal': + Beschreibung + Aufgaben + Form + Größe
- 'full': + Erweiterte Optionen (Löschen, Export, Verlauf)
```

## Verifikation

- ✅ Inline-Edit für Name/Beschreibung funktioniert
- ✅ Color-Picker updated Knoten live
- ✅ Form-Änderung sichtbar im Knoten
- ✅ Größen-Slider verändert Knoten live
- ✅ Aufgaben-Toggle updated Progress automatisch
- ✅ Detail-Level filtert Sektionen korrekt
- ✅ Smiley-Picker öffnet sich richtig positioniert
- ✅ Alle Änderungen werden gespeichert (DB sync)
