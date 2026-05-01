# Phase 2: Authentication mit Supabase

## Aufgabe

Setup Supabase Auth: E-Mail/Password + Google OAuth + Magic Link.

## Schritte

1. **Supabase-Projekt erstellen** (Frankfurt-Region!) und Keys in `.env.local`.

2. **Clients:**
   - `lib/supabase/client.ts` (Browser)
   - `lib/supabase/server.ts` (Server Components)
   - `lib/supabase/middleware.ts` (Session-Refresh)

3. **Middleware** im Root `middleware.ts` für Route-Protection.

4. **Auth-Routes** in `app/(auth)/`:
   - `login/page.tsx` — E-Mail-Form + Google-Button + Magic-Link
   - `signup/page.tsx`
   - `callback/route.ts` — OAuth Handler
   - `logout/route.ts`

5. **Geschützte Routes** unter `app/(dashboard)/` — Middleware checkt Auth.

6. **Email-Templates auf Deutsch** im Supabase-Dashboard.

## Wichtig

- **Cookies, NICHT localStorage** (Server Components brauchen Cookie-Access)
- Middleware MUSS Session refreshen bei jedem Request
- Verwende `@supabase/ssr` (nicht das alte `auth-helpers`)

## Verifikation

- ✅ Login mit E-Mail funktioniert
- ✅ Google OAuth funktioniert
- ✅ Magic Link wird per E-Mail gesendet (auf Deutsch)
- ✅ Geschützte Routes redirecten zu `/login`
- ✅ Session bleibt nach Refresh erhalten
