# Phase 7: KI-Service Integration

> Voraussetzung: Canvas + Detail-Panel + Views funktionieren. AI-Chat-Widget als Mock vorhanden.

## Aufgabe

Bau zentralen `aiService.ts` der ALLE KI-Anfragen verwaltet.

## Architektur

```
User klickt "Senden" im AI-Chat
   → AiChat.tsx → aiStore.send()
   → aiService.ts → routeRequest()
   → anthropic.ts | google.ts | huggingface.ts
   → Response + Cost-Tracking
   → ai_history INSERT
   → UI Update
```

## `lib/ai/aiService.ts`

```typescript
type Feature = 'chat' | 'p2s' | 'review' | 'summary' | 'task-suggest' | 'image'
type Model = 'haiku' | 'sonnet' | 'gemini-flash' | 'gemini-lite' | 'flux1'

interface AiRequestParams {
  feature: Feature
  prompt: string
  context: { mapId?: string; nodeId?: string; userPlan: string; userId: string }
  modelOverride?: Model
  systemPrompt?: string
  temperature?: number
}

interface AiResponse {
  text: string
  model: Model
  tokensUsed: { input: number; output: number; total: number }
  costUsd: number
  durationMs: number
}

export async function aiRequest(params: AiRequestParams): Promise<AiResponse> {
  // 1. Plan-Limits prüfen
  const limits = await checkLimits(params.context.userId)
  if (limits.exceeded) throw new RateLimitError(limits.message)
  
  // 2. Modell wählen
  const model = params.modelOverride || pickModelForPlan(params.context.userPlan, params.feature)
  
  // 3. Provider-Routing
  const provider = getProvider(model)
  
  // 4. Request
  const start = Date.now()
  const response = await provider.complete({...})
  
  // 5. Kosten
  const costUsd = calculateCost(model, response.tokensUsed)
  
  // 6. Logging
  await supabase.from('ai_history').insert({...})
  
  return { text, model, tokensUsed, costUsd, durationMs }
}
```

## Provider

### `lib/ai/providers/anthropic.ts`
```typescript
import Anthropic from '@anthropic-ai/sdk'
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

export const anthropicProvider = {
  async complete({ model, prompt, systemPrompt, temperature }) {
    const modelMap = {
      'haiku': 'claude-haiku-4-5-20251001',
      'sonnet': 'claude-sonnet-4-6',
    }
    const response = await client.messages.create({
      model: modelMap[model],
      max_tokens: 2048,
      temperature,
      system: systemPrompt || 'Du bist eine hilfreiche KI für Claromap.',
      messages: [{ role: 'user', content: prompt }],
    })
    return {
      text: response.content[0].type === 'text' ? response.content[0].text : '',
      tokensUsed: { ... }
    }
  }
}
```

### `lib/ai/providers/google.ts`
Gemini Flash + Flash-Lite über `@google/generative-ai`.

### `lib/ai/providers/huggingface.ts`
FLUX.1 für Bildgenerierung. Returns Image-URL nach Upload zu Supabase Storage.

## Modell-Routing

```typescript
function pickModelForPlan(plan: string, feature: Feature): Model {
  if (plan === 'free') return 'gemini-lite'
  if (feature === 'image') {
    if (plan === 'free') throw new Error('Bildgenerierung erst ab Pro')
    return 'flux1'
  }
  if (feature === 'p2s') {
    if (!['team', 'enterprise'].includes(plan)) throw new Error('P2S ist Team/Enterprise')
    return 'sonnet'
  }
  switch (plan) {
    case 'starter': case 'pro': return 'haiku'
    case 'team': return prompt.length > 500 ? 'sonnet' : 'haiku'
    case 'enterprise': return 'sonnet'
    default: return 'gemini-lite'
  }
}
```

## Limits

```typescript
async function checkLimits(userId: string) {
  const today = new Date().toISOString().slice(0,10)
  const { data: usage } = await supabase
    .from('ai_history')
    .select('cost_usd')
    .eq('user_id', userId)
    .gte('created_at', today)
  
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('plan')
    .eq('user_id', userId).single()
  
  const limits = {
    free: { reqPerDay: 50, costPerMo: 0.50 },
    starter: { reqPerDay: 200, costPerMo: 3 },
    pro: { reqPerDay: 500, costPerMo: 8 },
    team: { reqPerDay: 1000, costPerMo: 20 },
    enterprise: { reqPerDay: Infinity, costPerMo: Infinity },
  }
  // ...
}
```

## API-Routes

- `app/api/ai/chat/route.ts` — Standard-Chat
- `app/api/ai/p2s/route.ts` — Prompt-to-Structure
- `app/api/ai/review/route.ts` — Weekly Review
- `app/api/ai/image/route.ts` — Bildgenerierung

## Tests

```typescript
- Free-User → Gemini Lite
- Team-User mit langem Prompt → Sonnet
- Über-Limit → RateLimitError
- ai_history loggt jede Anfrage
- Kosten korrekt berechnet
```

## Verifikation

- ✅ AI-Chat sendet echte Anfragen an Claude
- ✅ Kosten in ai_history geloggt
- ✅ Plan-Limits enforced
- ✅ FLUX.1-Bilder funktionieren + landen in Storage
- ✅ Token-Verbrauch im UI sichtbar (für Power-User)
