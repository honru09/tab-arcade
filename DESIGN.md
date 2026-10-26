---
name: TabArcade Design System
description: Poki-inspired navy dark theme with solid stepped surfaces, original feed covers, and zero glassmorphism
colors:
  bg: "#070a16"
  panel: "#101830"
  panel2: "#182242"
  panel3: "#212d55"
  band-alt: "#0c1330"
  line: "rgba(148, 178, 255, 0.16)"
  text: "#f2f6ff"
  muted: "#9fb0cc"
  amber: "#ffb020"
  cyan: "#38e1ff"
  violet: "#8b5cf6"
  pink: "#ff5da2"
  white: "#ffffff"
  header-bg: "#0a0f22"
  player-bg: "#000000"
  player-border: "rgba(255, 255, 255, 0.22)"
  toolbar-bg: "#0d1328"
  theatre-bg: "#000000"
  loading-scrim: "rgba(7, 10, 22, 0.75)"
  facade-shade: "linear-gradient(180deg, rgba(5, 8, 18, 0.12) 0%, rgba(5, 8, 18, 0.65) 80%)"
  grad: "linear-gradient(92deg, #ffd23e, #ff5da2 48%, #38e1ff)"
typography:
  ui: "system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
  display: "'Avenir Next', 'Segoe UI', system-ui, -apple-system, Roboto, Helvetica, Arial, sans-serif"
radii:
  tile: "20px"
  card: "16px"
  chip: "999px"
  button: "999px"
  search: "999px"
  player: "20px"
  toolbar: "14px"
shadows:
  card: "0 1px 2px rgba(0, 0, 0, 0.45), 0 10px 24px -12px rgba(0, 0, 0, 0.55)"
  card-hover: "0 2px 4px rgba(0, 0, 0, 0.5), 0 20px 36px -12px rgba(0, 0, 0, 0.65)"
  tile: "0 2px 6px rgba(0, 0, 0, 0.4), 0 16px 30px -14px rgba(0, 0, 0, 0.6)"
  tile-hover: "0 4px 10px rgba(0, 0, 0, 0.5), 0 24px 40px -14px rgba(0, 0, 0, 0.7)"
  player: "0 30px 60px -18px rgba(0, 0, 0, 0.8)"
  sticky: "0 16px 34px rgba(0, 0, 0, 0.65)"
dimensions:
  wrap-max: "1180px"
  side-rail-width: "300px"
  toolbar-height: "48px"
  h-budget-desktop: "calc(min(78svh, 680px) - 52px)"
  h-budget-mobile: "calc(72svh - 48px)"
  theatre-z: "99999"
motion:
  press-feedback: "120ms"
  fade-in: "160ms"
  hover-transition: "180ms"
  drawer-transition: "450ms"
  timeout-error: "12000ms"
---

# TabArcade Design System (v9)

## 1. Design Read

A fast, tactile browser games shelf whose primary mission is transitioning a visitor from browsing to playing within two taps. Visuals are grounded in Poki's high-density square tile mosaic and CrazyGames' dark stepped surface ramp (`#070a16` → `#101830` → `#182242` → `#212d55`), pairing solid opaque elevation with high-contrast type.

## 2. Solid Surfaces & The Anti-Glass Discipline

- **Zero Backdrop-Filter**: Benchmarked leaders (Poki, CrazyGames, CoolMath, Hooda Math) show 0 content `backdrop-filter` usage. Cards, panels, drawers, toolbars, and sticky controls rely strictly on solid fills, hairline borders (`--line: rgba(148, 178, 255, 0.16)`), and physical drop shadows.
- **Stepped Ramp**: Elevation is expressed by stepping up the ramp:
  - Base canvas: `--bg #070a16` with low-poly geometric facet texture (3-5% opacity).
  - Resting cards & drawers: `--panel #101830`.
  - Nested chips & hover states: `--panel2 #182242`.
  - Active selections & prominent buttons: `--panel3 #212d55`.
- **Text Ink**: Solid `#f2f6ff` for primary headings and labels; `--muted #9fb0cc` for descriptions and secondary metadata. Gradient text is strictly quarantined to the brand logo wordmark.

## 3. The Poki Tile System

- **Geometry**: Aspect ratio 1:1 square tiles, 20px border radius, full-bleed original feed artwork.
- **Label Discipline**: Titles live on hover pills (`rgba(5, 8, 18, 0.88)` solid scrim) on pointer-fine devices, leaving artwork completely unobstructed.
- **Mosaic Rhythm**: Runs of 12 tiles where positions 0 and 5 scale to 2×2 hero tiles. At 2, 3, and 6 columns, this packs with zero gaps across all viewport widths.
- **Tactile Response**: Tile active state provides immediate press feedback in 120ms (`transform: scale(0.97); opacity: 0.92;`), with an unmistakable 2px solid cyan focus ring.

## 4. Player-First Staging & Ratio-Correct Geometry

- **Top Placement**:
  - Desktop game page player top lands at ≤170px.
  - Mobile game page player top lands at ≤200px.
  - Removed decorative stage art bursts, 54px top padding, and glowing disc plates.
- **Ratio-Correct Frame Sizing**:
  - Solves container width from a viewport height budget:
    `width = min(100%, calc(var(--h-budget) * var(--ratio)))`
    `aspect-ratio: var(--game-w) / var(--game-h)`
  - Portrait games (e.g., 0.46 ratio) render as slim, tall, centered frames with zero horizontal pillarbox distortion.
  - Ultrawide games (e.g., 2.22 ratio) expand to full container width without vertical clipping.
- **Facade & Start Lifecycle**:
  - `pointerdown` begins iframe construction immediately.
  - LOADING state shows dimmed poster, smooth CSS spinner (`@keyframes playerSpin`), title, and reassurance hint.
  - On `load`, game fades in over 160ms, sets `data-state="playing"`, and shifts keyboard focus into the iframe.
  - 12s timeout presents a designed in-frame ERROR state with an unlimited [Try again] recovery path and a [Browse more games] escape.

## 5. Toolbar, Theatre Mode & Side Rail

- **Toolbar**: Anchored beneath the player frame. Contains truncating title and inline-SVG action buttons (Restart, Fullscreen, Next game). No emoji as functional icons.
- **Theatre Mode**: Fallback when native `requestFullscreen` fails or is absent (iOS Safari). Transitions the shell into a fixed `100dvh` overlay (`z-index: 99999`) with a floating Exit button and Escape key listener.
- **Desktop ≥1100px Layout**: Two columns consisting of the main player area and a 300px side rail housing "Up next" related games and "Jump back in" history cards.

## 6. Contextual Mobile Sticky Bar

- Positioned fixed along the bottom edge on screens ≤760px.
- Driven by an `IntersectionObserver` watching `#playerFrame`: remains completely hidden while the player is in viewport, sliding up only when the player scrolls off-screen.
- Contextual CTA: "Play" before first activation, transforming to "Back to game" once playing. Tapping centers the game frame smoothly.

## 7. Accessibility & Motion

- Strict compliance with `prefers-reduced-motion`: animation iterations drop to instant transitions; spinners remain stationary.
- Keyboard navigation: visible `:focus-visible` rings, dialogs manage and restore focus, and iframe automatically receives focus on start.

## 8. Brand Mark & Icon System

- **Hero Mark**: TB-E 'BotPad' — an authentic hardware-inspired mascot face built from gaming anatomy:
  - **Left Eye**: Deep navy (`#0B1020`) gaming controller D-pad cross cut-out.
  - **Right Eye**: Oversized hot pink (`#FF2A85`) arcade action pushbutton with white specular highlight.
  - **Mouth**: Joyful dark navy smile arc (`#0B1020`), evoking tactile retro mascot charm.
  - **Chassis**: Electric cyan gradient squircle (`#00F0FF` → `#008BE8`) topped by dual tactile controller bumper ears.
  - **Semiotic Discipline**: 0% video/streaming play-triangle cues. Completely eliminates confusion with video streaming services (YouTube/Twitch) and ensures study-hall school-safe teacher perception.
- **Source Files**:
  - Master vector mark: `redesign/logo-v9/round2/tb-concept-e-mark.svg`
  - Master lockup: `redesign/logo-v9/round2/tb-concept-e-lockup.svg`
- **Favicon & Icon Simplification**:
  - `favicon.svg` (and `favicon-32.png`): Engineered for low-resolution 16×16 and 32×32 tab bar legibility. D-pad cross arms use clean 90° corners (eliminating subpixel anti-aliasing blur from tiny corner radiuses), reinforced 5.0-unit stroke weights on the 64 grid, concentrated specular highlight to preserve rich hot-pink saturation on the action button, and a strong smile arc. Renders crisp with transparent background across both dark and light browser tab themes.
  - **Maskable & App Icons** (`icon-192.png`, `icon-512.png`, `apple-touch-icon.png`, `icon-app.svg`): Feature a solid deep-navy background (`#0B1020`) matching the site's dark palette, with the BotPad mark scaled and centered within the W3C 80% safe zone circle (diameter 409.6px on 512 grid) to guarantee zero clipping under Android squircle/circle masks or iOS rounded icon frames.
