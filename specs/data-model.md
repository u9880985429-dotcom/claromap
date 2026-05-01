# Data Model — Detailliertes Schema

## Tabellen

### `maps`
```sql
CREATE TABLE maps (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  team_id         uuid REFERENCES teams(id) ON DELETE SET NULL,
  title           text NOT NULL DEFAULT 'Neue Map',
  description     text,
  background_color    text NOT NULL DEFAULT '#F8F9FB',
  background_pattern  text NOT NULL DEFAULT 'dots' CHECK (background_pattern IN ('dots','grid','lines','none')),
  theme           text NOT NULL DEFAULT 'default' CHECK (theme IN ('default','dark','hand')),
  is_template     boolean DEFAULT false,
  is_public       boolean DEFAULT false,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);
CREATE INDEX idx_maps_user ON maps(user_id);
CREATE INDEX idx_maps_team ON maps(team_id);
```

### `nodes`
```sql
CREATE TABLE nodes (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  map_id          uuid NOT NULL REFERENCES maps(id) ON DELETE CASCADE,
  step_number     int NOT NULL DEFAULT 1,
  emoji           text DEFAULT '📌',
  name            text NOT NULL DEFAULT 'Neuer Knoten',
  short_desc      text,
  description     text,
  color           text NOT NULL DEFAULT '#4A9EFF',
  text_color      text NOT NULL DEFAULT '#FFFFFF',
  shape           text NOT NULL DEFAULT '50%' CHECK (shape IN ('50%','20%','8%','0%','leaf')),
  width           int NOT NULL DEFAULT 120,
  height          int NOT NULL DEFAULT 120,
  position_x      int NOT NULL DEFAULT 0,
  position_y      int NOT NULL DEFAULT 0,
  status          text NOT NULL DEFAULT 'idea' CHECK (status IN ('done','wip','warning','idea','blocked','ready')),
  status_icon     text NOT NULL DEFAULT '🌱',
  progress        int NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  label_position  text NOT NULL DEFAULT 'inside' CHECK (label_position IN ('inside','outside')),
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);
CREATE INDEX idx_nodes_map ON nodes(map_id);
```

### `connections`
```sql
CREATE TABLE connections (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  map_id          uuid NOT NULL REFERENCES maps(id) ON DELETE CASCADE,
  from_node_id    uuid NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
  to_node_id      uuid NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
  step_label      text,
  number          int,
  color           text DEFAULT '#9CA3AF',
  line_style      text DEFAULT 'solid' CHECK (line_style IN ('solid','dashed','dotted')),
  created_at      timestamptz DEFAULT now()
);
CREATE INDEX idx_conn_map ON connections(map_id);
```

### `tasks`
```sql
CREATE TABLE tasks (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  node_id         uuid NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
  text            text NOT NULL,
  description     text,
  done            boolean DEFAULT false,
  order_index     int DEFAULT 0,
  due_date        date,
  created_at      timestamptz DEFAULT now()
);
CREATE INDEX idx_tasks_node ON tasks(node_id);
```

### `annotations`
```sql
CREATE TABLE annotations (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  node_id         uuid NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
  user_id         uuid NOT NULL REFERENCES auth.users(id),
  text            text NOT NULL,
  created_at      timestamptz DEFAULT now()
);
```

### `ai_history`
```sql
CREATE TABLE ai_history (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  map_id          uuid REFERENCES maps(id) ON DELETE SET NULL,
  feature         text NOT NULL,
  model           text NOT NULL,
  prompt          text NOT NULL,
  response        text,
  tokens_input    int DEFAULT 0,
  tokens_output   int DEFAULT 0,
  cost_usd        decimal(10,6) DEFAULT 0,
  duration_ms     int,
  created_at      timestamptz DEFAULT now()
);
CREATE INDEX idx_ai_user_date ON ai_history(user_id, created_at DESC);
```

### `subscriptions`
```sql
CREATE TABLE subscriptions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  plan            text NOT NULL DEFAULT 'free' CHECK (plan IN ('free','starter','pro','team','enterprise')),
  stripe_customer_id  text,
  stripe_sub_id   text,
  trial_ends_at   timestamptz,
  current_period_end  timestamptz,
  status          text NOT NULL DEFAULT 'active' CHECK (status IN ('trialing','active','canceled','past_due')),
  cancel_at_period_end boolean DEFAULT false,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);
```

### `teams` & `team_members`
```sql
CREATE TABLE teams (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  owner_id    uuid NOT NULL REFERENCES auth.users(id),
  created_at  timestamptz DEFAULT now()
);

CREATE TABLE team_members (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id     uuid NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role        text NOT NULL DEFAULT 'member' CHECK (role IN ('owner','admin','member','viewer')),
  joined_at   timestamptz DEFAULT now(),
  UNIQUE(team_id, user_id)
);
```

## Row-Level-Security

```sql
ALTER TABLE maps ENABLE ROW LEVEL SECURITY;
ALTER TABLE nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Maps
CREATE POLICY "users_select_own_maps" ON maps FOR SELECT
  USING (auth.uid() = user_id OR is_public = true OR
         team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid()));
CREATE POLICY "users_insert_own_maps" ON maps FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users_update_own_maps" ON maps FOR UPDATE
  USING (auth.uid() = user_id);
CREATE POLICY "users_delete_own_maps" ON maps FOR DELETE
  USING (auth.uid() = user_id);

-- Nodes (über Map-Zugriff)
CREATE POLICY "nodes_via_map" ON nodes FOR ALL
  USING (map_id IN (SELECT id FROM maps));

-- Connections
CREATE POLICY "conn_via_map" ON connections FOR ALL
  USING (map_id IN (SELECT id FROM maps));

-- Tasks
CREATE POLICY "tasks_via_node" ON tasks FOR ALL
  USING (node_id IN (SELECT id FROM nodes WHERE map_id IN (SELECT id FROM maps)));
```

## Trigger für updated_at

```sql
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_maps BEFORE UPDATE ON maps
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
CREATE TRIGGER set_updated_at_nodes BEFORE UPDATE ON nodes
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
```

## Seed-Daten

Eine Demo-Map "Mein erstes Projekt" mit 5 Knoten (Idee → Planung → Umsetzung → Hindernis → Ziel) und 4 Verbindungen, analog zum Prototyp.
