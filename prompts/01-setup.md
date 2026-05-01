# Phase 1: Projekt-Setup

## Aufgabe

Setze ein neues Next.js 15 Projekt mit dem Stack aus CLAUDE.md auf.

## Schritte

1. **Init:**
```bash
pnpm create next-app@latest . --typescript --tailwind --app --no-src-dir --import-alias "@/*"
```

2. **Core-Dependencies:**
```bash
pnpm add @supabase/supabase-js @supabase/ssr
pnpm add zustand
pnpm add @anthropic-ai/sdk
pnpm add @google/generative-ai
pnpm add stripe
pnpm add lucide-react
pnpm add clsx tailwind-merge
```

3. **Dev-Dependencies:**
```bash
pnpm add -D @types/node prettier prettier-plugin-tailwindcss
```

4. **Ordner-Struktur** wie in CLAUDE.md anlegen.

5. **Design-Tokens** in `app/globals.css` (siehe `specs/design-tokens.md`).

6. **`lib/utils/cn.ts`:**
```typescript
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)) }
```

7. **`.env.local.example`** mit allen Secrets aus README.

8. **Prettier:**
```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

9. **Test-Seite** `app/page.tsx` mit "Claromap" Schriftzug zur Verifikation.

## Verifikation

- ✅ `pnpm dev` startet ohne Fehler
- ✅ localhost:3000 zeigt "Claromap" mit Gold-Gradient
- ✅ TypeScript strict mode aktiv
- ✅ Tailwind funktioniert
- ✅ Ordner-Struktur vollständig

Wenn alles läuft → Phase 2.
