# TabArcade — Product Specification (v9)

TabArcade is an unblocked free browser games portal built for Chromebooks, desktop PCs and mobile browsers. Every game runs in a standard browser tab with zero downloads, zero installs and zero sign-ups.

## 1. Audience & Core Task

- **Target Audience**: Students on school Chromebooks, laptop users and mobile players seeking fast, unblocked web games.
- **Core Value Proposition**: Instant play in 2 taps. No friction, no popups blocking the first click, no bloated app wrappers.
- **Audience Demand Hierarchy**: Agility & endless running > driving & drifting > .io multiplayer > sports (football/soccer, 2-player) > puzzle & merge (high session length) > shooter > casual & simulation.

## 2. Core Journey: 2 Taps to Play

1. **Tap 1 (Browse to Game Page)**:
   - User enters homepage or category hub.
   - Immediate feedback on tile press (120ms transform/opacity, visible focus ring).
   - Intent prefetch: pointerenter, focusin, or touchstart on any game tile or search result prefetches the destination game page (`link rel="prefetch"` once per URL).
   - User lands on player-first game page.
2. **Tap 2 (Start Playing)**:
   - Player arrives near top of viewport (desktop top ≤170px, mobile top ≤200px).
   - Facade poster displays original game art with high-contrast play button.
   - `pointerdown` on facade initiates instant iframe creation.
   - In-frame LOADING state renders within 150ms: dimmed poster, reduced-motion safe spinner, "Loading {title}…", hint line.
   - On iframe `load`, game fades in (160ms), player marks `data-state="playing"`, and focus transfers directly into the iframe so arrow keys and space drive gameplay immediately.

## 3. Product Structure & Key Pages

### 3.1 Home Page (`/`)
- **Header**: Sticky solid navy bar (`#0a0f22`), logo with solid text, instant client-side search index ranked revenue-first, horizontal category pills.
- **Title Strip**: Compact H1 and lede preserving SEO indexing while placing games high on screen.
- **Jump Back In Rail**: Client-side shelf populated from `localStorage` (`ta-recent`, max 8, deduped). Renders as the first shelf if items exist; reserves 0 space (zero CLS) if empty.
- **Featured Shelf & Static Game of the Day**:
  - Replaces the retired auto-popup modal with a static, labelled Game of the Day banner inside the Featured section.
  - Featured Mosaic: 12 GameMonetize titles covering Agility, Driving, .IO, Sports and Puzzle. Hero tiles 0 and 5 (2×2 supercells) are landscape GM titles. Zero horror imagery on the front screen.
- **Category Bands**: Stepped solid panel backgrounds (`#070a16` and `#0c1330`) hosting Driving, Running, Math, .IO, Sports shelves.
- **Why TabArcade**: SEO disclosure accordion.

### 3.2 Category Hubs (`/[hub]/`)
- Themed hubs (Classroom, Chromebook, Driving, Running, Math, .IO, 2 Player, Best Games).
- Clean hero banner with category tagline.
- Dynamic "Jump back in" rail if history exists.
- 48-tile catalog grid sorted revenue-first.
- Descriptive educational / unblocked context text drawers.

### 3.3 Game Pages (`/games/[slug]/`)
- **Back Navigation**: Single "← All games" back link replacing bloated crumbs while preserving `BreadcrumbList` JSON-LD.
- **Compact Title Row**: Single-line H1, primary category chip, and control summary chips.
- **Player Area**:
  - Stage key-art, 54px burst padding, and disc plate completely removed.
  - Ratio-correct frame sizing for ratios 0.46 through 2.22 solved from height budget (`desktop: calc(min(78svh, 680px) - 52px)`, `mobile: calc(72svh - 48px)`), centered via `margin-inline: auto`.
  - Head contains per-game `preconnect` and `dns-prefetch` for embed origin.
  - Facade, Loading, Error (12s timeout with unlimited Try again recovery and Browse more games).
- **Player Toolbar**:
  - Attached directly below frame. Truncating game title (never wraps).
  - Inline SVG action buttons: Restart, Fullscreen (with Theatre Mode fallback), Next game.
- **Theatre Mode**:
  - Fallback when native `requestFullscreen` fails or is rejected (iOS Safari).
  - Fixed full-viewport overlay (`100dvh`, `z-index: 99999`) with dedicated Exit control and Escape key support.
- **Desktop ≥1100px Two-Column Layout**:
  - Main column: player, toolbar, lede, about/controls drawers, FAQ accordion.
  - 300px Side rail: "Up next" compact vertical cards followed by "Jump back in" history cards.
- **Contextual Mobile Sticky Bar**:
  - Position fixed bottom bar with solid dark background.
  - Monitored by `IntersectionObserver`: completely hidden while the player is on screen, appears when scrolled away.
  - Dynamic button label: "Play" before activation, "Back to game" once playing.
  - Tap scrolls player smoothly into viewport center and activates if needed.

## 4. Revenue-First Ordering Engine

Placement reflects current commercial reality: GameMonetize generates revenue (45% share, approved domains), whereas GameDistribution currently yields $0.
- Implemented in `src/lib/games.mjs` via `scoreGame(game)`:
  1. `MONETIZED_SOURCES = new Set(['gamemonetize'])`: GM games prioritized.
  2. Category demand weight (Agility/Runner > Driving > .IO > Sports > Puzzle > Shooter > Casual).
  3. Session-depth bonus (.io, merge, puzzle, endless-runner tags).
  4. Horror demotion: horror / scary / zombie titles penalized so no scary faces land on front screens.
  5. Deterministic tie-breaker via catalog index and existing featured flag.
- GD games are preserved in all catalog filters, SEO pages, and alphabetical listings; ordering changes, membership never drops.
- Related games use relevance score first, then revenue score tie-breaking ("revenue-first within relevance").
- Search index uses exact prefix match first, then revenue score.

## 5. Hard Constraints & Compliance

- Zero changes to URLs, slugs, canonicals, page titles, or meta descriptions.
- Zero edits to `src/data/*.json`.
- Zero `backdrop-filter` declarations across entire codebase. All surfaces solid.
- No fabricated metrics, ratings, or player counts.
- Covers remain original feed thumbnails.
