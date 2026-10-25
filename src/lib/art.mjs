import { u } from './games.mjs';

/**
 * Hero "pop-out" key art: AI-generated character art with the background
 * keyed out to real transparency (public/art/<slug>.webp). Used to layer
 * over game cards, the home hero spotlight and game-page stages so the
 * subject genuinely breaks out of the thumbnail frame.
 */
const ART_SLUGS = new Set([
  'snow-rider-neo',
  'car-eats-car-3d',
  'drag-shift-street-race',
  'geometry-vibes-2-online',
  'cube-snake-2048',
  'tennis-masters-2026',
  'color-sort-party',
  'typeblade-shadow-dojo',
  'rocketman',
  'shooter-soldiers-vs-zombies',
  'wheelie-spooky',
  'zombie-sprint',
  'speedy-runner',
  'football-penalty-2026',
  'war-space',
]);

export const artUrl = (game) => (game && ART_SLUGS.has(game.slug) ? u(`art/${game.slug}.webp`) : null);

/**
 * Animated covers: RETIRED in the v5 pass. The loops (composited from the
 * key art) used to swap in over the original feed thumbnail on hover; the
 * rule now is covers are always the original feed artwork, and generated
 * art only ever appears as an overlay flourish (pop-out art, spotlight,
 * stage art, banners, GOTD). The loop files were removed from public/anim
 * (they also cost 300-580 KB per card on mobile).
 */

/** Themed banner art for hub heroes (public/bg/<name>.webp). */
export const bannerUrl = (hub) => (hub && hub.banner ? u(`bg/${hub.banner}.webp`) : null);

/** Per-category accent color driving card glows, chips and stage lighting. */
const ACCENTS = {
  'Racing & Driving': '#ff6a3d',
  Agility: '#a3e635',
  Puzzle: '#c084fc',
  Merge: '#c084fc',
  'Match-3': '#c084fc',
  '.IO': '#22d3ee',
  Sports: '#4ade80',
  Football: '#4ade80',
  Shooter: '#fb7185',
  Battle: '#f87171',
  Adventure: '#fbbf24',
  Casual: '#f472b6',
  Simulation: '#38bdf8',
  Strategy: '#818cf8',
  Educational: '#2dd4bf',
  Quiz: '#2dd4bf',
};

export const accentFor = (game) => ACCENTS[game?.categories?.[0]] || '#ffb020';
