# Design Tokens

## CSS Variables — Default Theme (Hell)

```css
:root {
  /* Backgrounds */
  --bg:  #F8F9FB;
  --bg2: #FFFFFF;
  --bg3: #F1F3F8;
  --bg4: #E2E7F0;
  --bg5: #D0D6E2;

  /* Lines / Borders */
  --line:  rgba(0,0,0,0.07);
  --line2: rgba(0,0,0,0.13);
  --line3: rgba(0,0,0,0.22);

  /* Text */
  --text:  #0F1424;
  --text2: #3F465E;
  --text3: #6B7390;
  --text4: #9CA3B8;

  /* Brand */
  --accent:  #F5A623;  /* Claromap Gold */
  --accent2: #FF8C42;  /* Claromap Orange */

  /* Status Colors */
  --green:  #059669;   /* Done */
  --amber:  #D97706;   /* Warning */
  --blue:   #2563EB;   /* Info */
  --purple: #7C3AED;   /* Premium */
  --red:    #DC2626;   /* Danger */

  /* Border Radii */
  --r-sm:   8px;
  --r-md:   12px;
  --r-lg:   16px;
  --r-xl:   20px;
  --r-full: 9999px;

  /* Fonts */
  --font-display: 'Syne', sans-serif;       /* Headlines */
  --font-body:    'DM Sans', sans-serif;     /* Body */
  --font-hand:    'Caveat', cursive;         /* Hand-drawn */
  --font-mono:    'DM Mono', monospace;      /* Code/Numbers */

  /* Shadows */
  --shadow-soft:   0 2px 12px rgba(0,0,0,0.06);
  --shadow-mid:    0 4px 20px rgba(0,0,0,0.10);
  --shadow-strong: 0 12px 40px rgba(0,0,0,0.14);

  /* Background Pattern */
  --canvas-bg: #F8F9FB;
  --bg-grid-color: rgba(0,0,0,0.05);
}
```

## Dark Theme

```css
body[data-theme="dark"] {
  --bg:  #0A0C14;
  --bg2: #0F1219;
  --bg3: #161A24;
  --bg4: #1F2433;
  --bg5: #2A3045;
  --line:  rgba(255,255,255,0.06);
  --line2: rgba(255,255,255,0.11);
  --line3: rgba(255,255,255,0.18);
  --text:  #ECEEF5;
  --text2: #A4ABBF;
  --text3: #6B7390;
  --text4: #4A5168;
  --canvas-bg: #0A0C14;
  --bg-grid-color: rgba(255,255,255,0.05);
}
```

## Hand-Drawn Theme (Excalidraw-Style)

```css
body[data-theme="hand"] {
  --bg:  #FFFEF5;
  --bg2: #FFFFFA;
  --bg3: #FBF8E8;
  --bg4: #F5EFCB;
  --line:  rgba(60,40,10,0.12);
  --line2: rgba(60,40,10,0.22);
  --line3: rgba(60,40,10,0.4);
  --text:  #1A1410;
  --text2: #4A3B2A;
  --text3: #7A6A55;
  --text4: #A89880;
  --font-display: 'Kalam', cursive;
  --font-body:    'Patrick Hand', cursive;
  --canvas-bg: #FFFEF5;
  --bg-grid-color: rgba(60,40,10,0.08);
}
```

## Tailwind Config

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        bg2: 'var(--bg2)',
        bg3: 'var(--bg3)',
        bg4: 'var(--bg4)',
        bg5: 'var(--bg5)',
        text: 'var(--text)',
        text2: 'var(--text2)',
        text3: 'var(--text3)',
        text4: 'var(--text4)',
        accent: 'var(--accent)',
        'accent-2': 'var(--accent2)',
      },
      fontFamily: {
        display: 'var(--font-display)',
        body: 'var(--font-body)',
        hand: 'var(--font-hand)',
        mono: 'var(--font-mono)',
      },
      borderRadius: {
        sm: 'var(--r-sm)',
        md: 'var(--r-md)',
        lg: 'var(--r-lg)',
        xl: 'var(--r-xl)',
      },
      boxShadow: {
        soft: 'var(--shadow-soft)',
        mid: 'var(--shadow-mid)',
        strong: 'var(--shadow-strong)',
      },
    },
  },
} satisfies Config
```

## Animations

```css
/* Standard ease-out */
transition: all 0.3s cubic-bezier(0.32, 0.72, 0, 1);

/* Bouncy (für interaktive Elemente) */
transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);

/* Pulse (WIP / Warning Knoten) */
@keyframes wipPulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(245,166,35,0); }
  50%      { box-shadow: 0 0 0 8px rgba(245,166,35,0.15); }
}
```

## Color Palette für Knoten (Default)

```
Greens:   #10B981  #34D399  #059669
Yellows:  #F5A623  #FF8C42  #FBBF24
Blues:    #2563EB  #4A9EFF  #06B6D4
Purples:  #7C3AED  #A78BFA  #EC4899
Reds:     #DC2626  #FF6B6B  #D97706
Grays:    #6B7280  #9CA3AF  #1F2937
```

## Status Smileys

```
✅ Erledigt
⏳ In Arbeit
🌱 Geplant
⚠️ Achtung
🚀 Bereit zum Launch
🔒 Blockiert
🔥 Hot/Urgent
💡 Idee
⭐ Wichtig
🎯 Ziel
```
