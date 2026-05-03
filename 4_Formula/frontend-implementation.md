# ⚛️ Formula: Frontend Implementation

> **Bounded Context:** Next.js React Frontend  
> **Stage:** 4_Formula  
> **Date:** 2026-05-03  
> **Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS v4

---

## 📋 Objective

Build a modern, dark-themed React frontend that:
1. Accepts user text input
2. Displays real-time generation status
3. Visualizes musical metadata (valence, arousal, key, BPM)
4. Plays generated audio
5. Collects user feedback for refinement

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   Next.js Application                        │
│                    (frontend/pages/index.tsx)                │
├─────────────────────────────────────────────────────────────┤
│  Page Components     │  Shared Components    │  Utilities  │
│  ─────────────────── │  ──────────────────── │  ────────── │
│  index.tsx           │  AudioPlayer.tsx      │  globals.css│
│  _app.tsx            │  MoodVisualizer.tsx   │  axios      │
│                      │  FeedbackForm.tsx     │             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 Dependencies

**File:** `frontend/package.json`

```json
{
  "name": "beats-scorer-frontend",
  "version": "1.0.0",
  "dependencies": {
    "axios": "^1.7.9",
    "lucide-react": "^0.468.0",
    "next": "^15.1.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4.0.0",
    "@types/node": "^20.17.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "postcss": "^8.4.49",
    "tailwindcss": "^4.0.0",
    "typescript": "^5.7.2"
  }
}
```

**Rationale:**
- `next` — React framework with SSR/SSG
- `react` + `react-dom` — UI library
- `axios` — HTTP client for API calls
- `lucide-react` — Icon library (clean, consistent)
- `tailwindcss` v4 — Utility-first CSS (latest beta with `@theme`)
- `typescript` — Type safety

---

## 🔧 Implementation Steps

### Step 1: Tailwind CSS Configuration

**File:** `frontend/styles/globals.css`

```css
@import "tailwindcss";

@theme {
  --color-background: #0a0a0f;
  --color-foreground: #ffffff;
  --color-emerald-400: #34d399;
  --color-emerald-500: #10b981;
  --color-rose-400: #fb7185;
  --color-amber-400: #fbbf24;
  --color-sky-400: #38bdf8;
  --color-violet-400: #a78bfa;
  --color-orange-400: #fb923c;
}

body {
  background-color: var(--color-background);
  color: var(--color-foreground);
  -webkit-font-smoothing: antialiased;
}
```

**File:** `frontend/postcss.config.js`

```javascript
module.exports = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
```

**Design Tokens:**
- Background: `#0a0a0f` — Deep dark for music app feel
- Accent: `#10b981` (emerald-500) — Primary action color
- Supporting colors: rose, amber, sky, violet, orange for data viz

### Step 2: Next.js Configuration

**File:** `frontend/next.config.js`

```javascript
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/:path*`,
      },
    ];
  },
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
```

**Note:** Rewrites proxy `/api/*` to backend, but backend endpoints don't use `/api` prefix. This was adjusted during integration.

### Step 3: Main Page (`index.tsx`)

**State Management:**
```typescript
const [sentence, setSentence] = useState('');
const [isGenerating, setIsGenerating] = useState(false);
const [error, setError] = useState<string | null>(null);
const [result, setResult] = useState<GenerationResult | null>(null);
const [status, setStatus] = useState<string>('');
```

**Generation Flow:**
1. User types sentence
2. Click "Generate Music" (or Cmd+Enter)
3. Show progressive status updates:
   - "Analyzing sentiment..."
   - "Mapping to musical parameters..."
   - "Composing audio..."
   - "Finalizing..."
4. POST to `/generate-score` with `{ text: sentence }`
5. Parse response into `GenerationResult`
6. Display audio player, mood visualizer, rationale

**API Integration:**
```typescript
const response = await axios.post(
  `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/generate-score`,
  { text: sentence.trim() },
  { timeout: 60000 }
);
```

**Feedback Flow:**
1. User submits feedback (rating + issues + comment)
2. POST to `/review` with feedback + current metadata
3. Backend refines and returns new audio

### Step 4: AudioPlayer Component

**File:** `frontend/components/AudioPlayer.tsx`

**Features:**
- Play/Pause toggle
- Progress bar with seek
- Volume control with mute
- Time display (current / duration)
- Loading skeleton state
- Empty state placeholder

**Hooks Used:**
- `useRef` — Access `<audio>` element
- `useState` — Track play state, time, volume

**Event Handlers:**
- `onTimeUpdate` — Update current time
- `onLoadedMetadata` — Get duration
- `onEnded` — Reset play state

### Step 5: MoodVisualizer Component

**File:** `frontend/components/MoodVisualizer.tsx`

**Visualizations:**

1. **2D Mood Plane**
   - X-axis: Valence (Sad → Happy)
   - Y-axis: Arousal (Calm → Energetic)
   - Dot position animated based on metadata

2. **Valence Bar**
   - Color: Rose (`#fb7185`)
   - Width: `valence * 100%`

3. **Arousal Bar**
   - Color: Amber (`#fbbf24`)
   - Width: `arousal * 100%`

4. **Key Display**
   - Large text (e.g., "D minor")
   - Color: Sky (`#38bdf8`)

5. **BPM Display**
   - Large number (e.g., "140")
   - Color: Violet (`#a78bfa`)

6. **Instrumentation Tags**
   - Pill-shaped badges
   - Color: Orange (`#fb923c`)

### Step 6: FeedbackForm Component

**File:** `frontend/components/FeedbackForm.tsx`

**Features:**
- Thumbs up/down rating
- Issue tags: "Too loud", "Too fast", "Too slow", "Wrong mood", "Wrong instruments"
- Custom comment textarea
- Submit button with loading state
- Success confirmation with reset option

**State:**
```typescript
const [rating, setRating] = useState<'positive' | 'negative' | null>(null);
const [selectedIssues, setSelectedIssues] = useState<string[]>([]);
const [customFeedback, setCustomFeedback] = useState('');
const [isSubmitted, setIsSubmitted] = useState(false);
```

---

## 🎨 Design System

### Colors

| Token | Hex | Usage |
|-------|-----|-------|
| Background | `#0a0a0f` | Page background |
| Surface | `rgba(255,255,255,0.05)` | Cards, panels |
| Border | `rgba(255,255,255,0.10)` | Dividers, card borders |
| Primary | `#10b981` | Buttons, accents |
| Text Primary | `#ffffff` | Headings |
| Text Secondary | `rgba(255,255,255,0.60)` | Labels |
| Text Muted | `rgba(255,255,255,0.40)` | Hints |

### Typography

- Font: System sans-serif (Tailwind default)
- Heading: `text-3xl font-bold`
- Body: `text-base`
- Label: `text-sm font-medium uppercase tracking-wider`
- Mono: Used for keyboard hints

### Spacing

- Page max-width: `max-w-5xl mx-auto`
- Section padding: `py-10`
- Card padding: `p-6`
- Component gap: `gap-6`

---

## 🔗 Backend Integration

**Endpoint Mapping:**

| Frontend Action | Endpoint | Method | Payload |
|----------------|----------|--------|---------|
| Generate music | `/generate-score` | POST | `{ text: string, style_hint?: string }` |
| Submit feedback | `/review` | POST | `{ feedback: string, current_metadata: MusicalMetadata }` |

**Environment Variable:**
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**CORS:** Backend allows all origins (`*`) by default for local dev.

---

## 📁 File Reference

| File | Lines | Purpose |
|------|-------|---------|
| `frontend/pages/index.tsx` | 255 | Main page with generation flow |
| `frontend/pages/_app.tsx` | ~10 | App wrapper with styles |
| `frontend/components/AudioPlayer.tsx` | 167 | Audio playback controls |
| `frontend/components/MoodVisualizer.tsx` | 156 | Metadata visualization |
| `frontend/components/FeedbackForm.tsx` | 174 | User feedback form |
| `frontend/styles/globals.css` | 59 | Tailwind theme + custom styles |
| `frontend/next.config.js` | 18 | Next.js config |
| `frontend/package.json` | 27 | Dependencies |
| `frontend/tsconfig.json` | ~20 | TypeScript config |
| `frontend/postcss.config.js` | 5 | PostCSS config |

---

## 🎯 Design Decisions

| Decision | Rationale |
|----------|-----------|
| Pages Router (not App Router) | Simpler setup, familiar pattern, works with current Next.js 15 |
| Tailwind v4 (beta) | Latest features, `@theme` for CSS variables, but may have edge cases |
| No global state library | Component-level state is sufficient for this complexity |
| Axios over fetch | Better error handling, timeouts, interceptors |
| Lucide icons | Consistent, tree-shakeable, no font loading |
| 60s timeout | Audio generation may take time; prevents premature failures |
| Skeleton loaders | Better UX than spinners for content-heavy layouts |

---

## 🧪 Testing Gaps

- [ ] No Jest/React Testing Library configured
- [ ] No component unit tests
- [ ] No E2E tests (Playwright/Cypress)
- [ ] No visual regression tests

**Recommended:**
```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

---

*Created: 2026-05-03*  
*Template: delivery-pilot-template Stage 4*
