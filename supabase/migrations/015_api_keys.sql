-- Personal API-Keys für REST-Anbindung (z.B. via MCP-Server, Zapier,
-- curl, etc.). User generiert sich Keys in /settings/api-keys, der
-- Plaintext-Token wird nur EINMAL beim Erstellen angezeigt; in der DB
-- liegt nur ein SHA-256-Hash davon.
--
-- Token-Format: cmk_live_<32 base62-Zeichen>  (cmk = ClaroMapKey)

CREATE TABLE IF NOT EXISTS public.api_keys (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  key_hash     text        NOT NULL UNIQUE,
  key_prefix   text        NOT NULL,         -- erste 12 Zeichen des Tokens für die UI-Anzeige
  name         text        NOT NULL,         -- "MacBook qontroly", "n8n-Workflow", etc.
  created_at   timestamptz NOT NULL DEFAULT now(),
  last_used_at timestamptz,
  revoked_at   timestamptz                   -- NULL = aktiv
);

CREATE INDEX IF NOT EXISTS api_keys_user_id_idx ON public.api_keys(user_id);
CREATE INDEX IF NOT EXISTS api_keys_key_hash_idx ON public.api_keys(key_hash);

ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- RLS: User sieht/verwaltet nur seine eigenen Keys.
DROP POLICY IF EXISTS "api_keys_select_own" ON public.api_keys;
CREATE POLICY "api_keys_select_own"
  ON public.api_keys FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "api_keys_insert_own" ON public.api_keys;
CREATE POLICY "api_keys_insert_own"
  ON public.api_keys FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "api_keys_update_own" ON public.api_keys;
CREATE POLICY "api_keys_update_own"
  ON public.api_keys FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "api_keys_delete_own" ON public.api_keys;
CREATE POLICY "api_keys_delete_own"
  ON public.api_keys FOR DELETE
  USING (auth.uid() = user_id);
