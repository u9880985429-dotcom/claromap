// Helper für API-Keys: Token generieren, hashen, verifizieren.
//
// Token-Format: cmk_live_<32 base62-Zeichen>
//   cmk         = ClaroMapKey (Prefix)
//   live        = Environment-Marker (zukünftig auch 'test')
//   32 Zeichen  = ~190 bit Entropy (mehr als genug)
//
// In der DB speichern wir nur:
//   - key_hash:   SHA-256 vom Klartext-Token (hex)
//   - key_prefix: erste 12 Zeichen ("cmk_live_AbC") als visuelle ID

import { createHash, randomBytes } from 'crypto'

const TOKEN_BODY_LENGTH = 32
const PREFIX_LENGTH = 12 // 'cmk_live_' + erste 3 Zeichen des Bodys

// base62 alphabet (a-z, A-Z, 0-9) — keine Sonderzeichen, copy-paste-sicher
const ALPHABET =
  'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

/**
 * Generiert einen neuen Token im Format cmk_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.
 * Wird einmal dem User angezeigt, dann nur noch als Hash gespeichert.
 */
export function generateToken(): string {
  const bytes = randomBytes(TOKEN_BODY_LENGTH)
  let body = ''
  for (let i = 0; i < TOKEN_BODY_LENGTH; i++) {
    body += ALPHABET[bytes[i]! % ALPHABET.length]
  }
  return `cmk_live_${body}`
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

export function tokenPrefix(token: string): string {
  return token.slice(0, PREFIX_LENGTH)
}

/**
 * Liest aus einem `Authorization: Bearer cmk_live_xxx`-Header das Token.
 * Gibt null zurück, wenn das Format nicht passt.
 */
export function extractBearer(authHeader: string | null): string | null {
  if (!authHeader) return null
  const match = authHeader.match(/^Bearer\s+(cmk_live_[A-Za-z0-9]{32})$/)
  return match?.[1] ?? null
}
