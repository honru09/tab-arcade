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
 * Animated covers (public/anim/<slug>.webp): seamless ~2.4s loops composited
 * from the key art over a scrolling themed background (redesign/animate.py).
 * Cards swap the static feed thumb for the loop on hover / when the card is
 * alive in view. color-sort-party is intentionally absent — its key art is a
 * translucent splash that vanishes over a background, so it keeps the
 * Ken Burns treatment instead.
 */
const ANIM_SLUGS = new Set([
  'snow-rider-neo',
  'car-eats-car-3d',
  'drag-shift-street-race',
  'wheelie-spooky',
  'geometry-vibes-2-online',
  'cube-snake-2048',
  'tennis-masters-2026',
  'football-penalty-2026',
  'typeblade-shadow-dojo',
  'rocketman',
  'shooter-soldiers-vs-zombies',
  'zombie-sprint',
  'speedy-runner',
  'war-space',
]);

export const animUrl = (game) => (game && ANIM_SLUGS.has(game.slug) ? u(`anim/${game.slug}.webp`) : null);

/** Themed banner art for hub heroes (public/bg/<name>.jpg). */
export const bannerUrl = (hub) => (hub && hub.banner ? u(`bg/${hub.banner}.jpg`) : null);

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
