# Phase 8: Stripe Subscriptions + 14-Tage-Trial

> Voraussetzung: Auth + DB + AI-Service funktionieren.

## Aufgabe

Stripe-Integration mit 5 Tarifen + Opt-out-Pro-Trial + Webhook-Handler.

## Schritte

1. **Stripe Produkte anlegen** (im Stripe Dashboard):
   - Free $0
   - Starter $7/Mo + $5.60/Mo (jährlich = $67.20)
   - Pro $16/Mo + $12.80/Mo (jährlich)
   - Team $39/Mo + $31.20/Mo (jährlich)
   - Enterprise $149/Mo + $119/Mo (jährlich)

2. **Pricing-Page** `app/(marketing)/pricing/page.tsx`:
   - Toggle Monthly/Yearly
   - 5 Cards mit Features
   - "Pro Trial starten" Button bei Free
   - "Upgrade" Buttons bei höheren Plans

3. **Checkout-Flow** `app/api/stripe/checkout/route.ts`:
   - Erstellt Stripe Checkout Session
   - Redirect zu Stripe-hosted Checkout
   - Success-URL: `/billing/success`
   - Cancel-URL: `/pricing`

4. **Webhook-Handler** `app/api/stripe/webhook/route.ts`:
   - Verifiziert Stripe-Signature
   - Events: `customer.subscription.created`, `updated`, `deleted`, `trial_will_end`
   - Aktualisiert `subscriptions` Tabelle

5. **Trial-Logik:**
   - Beim Signup: Auto-Stripe-Customer + Pro-Trial 14 Tage
   - DSGVO-Checkbox: "Ich stimme der automatischen Umstellung auf Pro nach 14 Tagen zu (kann jederzeit gekündigt werden)"
   - 3 Tage vor Ende: E-Mail-Reminder
   - Bei Kündigung: Inhalte werden zu Mind-Map-Format konvertiert (nicht gelöscht!)

6. **Mind-Map-Konvertierung** `lib/billing/convertOnDowngrade.ts`:
   - Bei Downgrade von Pro → Free
   - Maps werden auf Read-Only gesetzt
   - Pro-Features deaktiviert
   - User bekommt prominentes "Pro reaktivieren" Banner

7. **Billing-Portal** `app/(dashboard)/billing/page.tsx`:
   - Aktuellen Plan zeigen
   - "Tarif wechseln" Button → Stripe Portal
   - "Rechnungen" Link
   - Trial-Restzeit-Anzeige

## Limits-Enforcement

In `aiService.ts` und überall wo Plan-relevant:

```typescript
async function checkPlanFeature(userId: string, feature: 'p2s'|'flux1'|'team') {
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('plan, trial_ends_at')
    .eq('user_id', userId).single()
  
  const isPro = ['pro','team','enterprise'].includes(sub.plan)
  const inTrial = sub.trial_ends_at && new Date(sub.trial_ends_at) > new Date()
  
  if (feature === 'p2s' && !['team','enterprise'].includes(sub.plan)) throw ...
  if (feature === 'flux1' && !(isPro || inTrial)) throw ...
}
```

## Tests

```typescript
- Webhook verifiziert Signature korrekt
- Trial wird nach 14 Tagen zu Pro
- Downgrade konvertiert Map zu Mind-Map-Format
- Rate-Limits werden plan-basiert enforced
- DSGVO-Checkbox wird gespeichert
```

## Verifikation

- ✅ Pricing-Page rendert alle 5 Tarife
- ✅ Stripe Checkout funktioniert
- ✅ Webhook updated DB korrekt
- ✅ Trial-Auto-Conversion klappt
- ✅ Bei Kündigung: Mind-Map-Konvertierung
- ✅ Billing-Portal ist erreichbar
- ✅ Plan-Limits in aiService funktionieren
