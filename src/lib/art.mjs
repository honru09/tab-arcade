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
]);

export const artUrl = (game) => (game && ART_SLUGS.has(game.slug) ? u(`art/${game.slug}.webp`) : null);

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
