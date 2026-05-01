# Phase 3: Datenbank-Schema mit Supabase

## Aufgabe

Erstelle alle Tabellen aus CLAUDE.md inkl. Row-Level-Security.

## Schritte

1. **Migrations-Datei** `supabase/migrations/001_initial_schema.sql`:
   - Alle 7 Tabellen aus CLAUDE.md (maps, nodes, connections, tasks, ai_history, subscriptions, teams)
   - Foreign Keys mit ON DELETE CASCADE
   - Default-Werte für background_color, theme, etc.

2. **Migration anwenden:**
```bash
npx supabase db push
```

3. **Row-Level-Security (RLS) Policies:**
```sql
-- maps: User sieht nur eigene oder Team-Maps
CREATE POLICY "users_own_maps" ON maps
FOR ALL USING (auth.uid() = user_id OR team_id IN (
  SELECT team_id FROM team_members WHERE user_id = auth.uid()
));

-- nodes: Wenn map_id zugänglich, dann nodes auch
CREATE POLICY "nodes_via_map" ON nodes
FOR ALL USING (map_id IN (SELECT id FROM maps));
-- (analog für connections, tasks)
```

4. **TypeScript-Types generieren:**
```bash
npx supabase gen types typescript --project-id xxx > types/database.ts
```

5. **Seed-Daten** für Demo:
   - Eine Beispiel-Map "Mein erstes Projekt"
   - 5 Beispiel-Knoten (analog zum Prototyp)
   - 4 Verbindungen mit Schritt-Nummern

6. **Helper-Functions** in `lib/supabase/queries/`:
   - `getMap(id)`, `getMaps(userId)`
   - `createMap`, `updateMap`, `deleteMap`
   - `createNode`, `updateNode`, `moveNode`, `resizeNode`, `deleteNode`
   - `createConnection`, `deleteConnection`
   - `createTask`, `updateTask`

## Verifikation

- ✅ Alle Tabellen existieren in Supabase Dashboard
- ✅ RLS Policies aktiv (User sieht nur eigene Daten)
- ✅ TypeScript-Types generiert
- ✅ Seed-Daten erfolgreich importiert
- ✅ Helper-Functions funktionieren in Server Components
