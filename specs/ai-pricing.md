# AI Pricing & Kosten-Berechnung

## Modell-Preise (Stand April 2026)

| Modell | Input ($/Mtok) | Output ($/Mtok) | Notizen |
|---|---|---|---|
| Claude Haiku 4.5 | $1.00 | $5.00 | Standard für Starter+/Pro |
| Claude Sonnet 4.6 | $3.00 | $15.00 | Premium für Team+/Enterprise |
| Gemini 2.5 Flash | $0.10 | $0.40 | Cheap fallback |
| Gemini 2.5 Flash-Lite | $0 | $0 | **1.000 free/Tag** für Free-User |
| FLUX.1 dev (HuggingFace) | — | $0.0012/Bild | 30× günstiger als Nano Banana paid |
| Nano Banana | — | $0 (500/Tag free) / $0.039/Bild | Free Pool only |

## Kosten pro Feature

### Standard-Chat (typischer Request)
- Input: ~300 tokens
- Output: ~600 tokens
- Mit Haiku: ($1 × 0.0003) + ($5 × 0.0006) = **$0.0033/Anfrage**
- Mit Sonnet: ($3 × 0.0003) + ($15 × 0.0006) = **$0.0099/Anfrage**
- Mit Gemini Lite: **$0** (im Free Tier)

### Prompt-to-Structure (P2S — Map aus Text generieren)
- Input: ~500 tokens (User-Prompt + System-Prompt)
- Output: ~1.500 tokens (strukturiertes JSON mit 5-15 Knoten)
- Mit Sonnet (P2S braucht Qualität): ($3 × 0.0005) + ($15 × 0.0015) = **$0.024/Generierung**

### Weekly Review
- Input: ~1.000 tokens (alle Knoten der Map)
- Output: ~800 tokens (Zusammenfassung + Empfehlungen)
- Mit Haiku: ($1 × 0.001) + ($5 × 0.0008) = **$0.005/Review**

## Kalkulation pro Plan (durchschnittlicher User)

### Free ($0)
- Annahme: 30 Anfragen/Tag, 30 Tage = 900/Monat
- Modell: Gemini Lite (Free Tier)
- **Infra-Kosten: ~$0.05/Monat** (nur Storage + DB)
- **Marge: 100% (außer Akquisitionskosten)**

### Starter ($7/Monat)
- Annahme: 100 Anfragen/Monat
- Modell: Haiku
- KI-Kosten: 100 × $0.0033 = $0.33
- Infra: $0.50
- **Total: $0.83 → Marge $6.17 (88%)**

### Pro ($16/Monat)
- Annahme: 300 Anfragen + 3 P2S + 10 Bilder
- KI-Kosten: 300 × $0.0033 + 3 × $0.024 + 10 × $0.0012 = $1.08
- Infra: $1
- **Total: $2.08 → Marge $13.92 (87%)**

### Team ($39/Monat — 5 User inkl.)
- Annahme: 5 × 200 Anfragen = 1.000 + 30 P2S
- KI-Kosten (80% Haiku, 20% Sonnet): 800 × $0.0033 + 200 × $0.0099 + 30 × $0.024 = $5.36
- Infra: $3
- **Total: $8.36 → Marge $30.64 (79%)**

### Enterprise ($149/Monat — 20 User)
- Eigener API-Key oft → eigene Kosten
- Sonst: 20 × 500 = 10.000 Anfragen
- KI-Kosten: 10.000 × $0.0099 = $99 (worst case)
- Infra: $10
- **Total: $109 → Marge $40 (27%)** — Enterprise-Preis sollte höher oder eigener Key Pflicht

## Kohorten-Modell

| Nutzer | MRR | Kosten | Marge |
|---|---|---|---|
| 100 (mix) | $496 | $124 | 75% |
| 1.000 | $5.000 | $1.100 | 78% |
| 10.000 | $50.000 | $8.000 | 84% |
| 100.000 | $500.000 | $65.000 | 87% |

**Annahme-Mix:** 60% Free, 25% Starter, 10% Pro, 4% Team, 1% Enterprise.

## Conversion-Rate

- Free → Paid: 14% organisch + 8% Trial-Effekt = **22% mit 14-Tage-Pro-Trial**
- Trial Opt-out-Rate: ~30% (sehr gut für SaaS)

## Break-Even

- Fixkosten (Vercel + Supabase + Domains + Mail): ~$50/Monat
- Bei $10 ARPU: **Break-Even bei 25 Paid-Nutzern**
