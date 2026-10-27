import gdGames from '../data/games.json';
import gmGames from '../data/games-gm.json';

export { gdGames, gmGames };

export const MONETIZED_SOURCES = new Set(['gamemonetize']);
export const MARQUEE_EXCLUDE = new Set(['ligmar-online']);

const normTitle = (s) => (s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

const CATEGORY_WEIGHTS = {
  'Agility': 700,
  'Racing & Driving': 600,
  '.IO': 500,
  'Sports': 400,
  'Football': 400,
  'Battle': 380,
  'Puzzle': 300,
  'Merge': 300,
  'Match-3': 280,
  'Educational': 250,
  'Quiz': 250,
  'Shooter': 200,
  'Casual': 100,
  'Simulation': 100,
  'Adventure': 100,
  'Strategy': 250,
  'Cards': 250,
  'Mahjong & Connect': 250,
  'Boardgames': 250,
};
const DEFAULT_CAT_WEIGHT = 260;

export function isHorror(g) {
  const text = `${g.title} ${(g.tags || []).join(' ')}`.toLowerCase();
  return /horror|scary|granny|zombie|creepy|deadfloor/i.test(text);
}

function sessionDepthBonus(g) {
  const text = `${g.title} ${(g.categories || []).join(' ')} ${(g.tags || []).join(' ')}`.toLowerCase();
  let bonus = 0;
  if (/(\.io|\bio\b|multiplayer)/i.test(text)) bonus += 60;
  if (/(endless|runner|running|dash|slope)/i.test(text)) bonus += 50;
  if (/(merge|puzzle|2048|tetris)/i.test(text)) bonus += 40;
  if (/(drift|racing|drifting)/i.test(text)) bonus += 30;
  return bonus;
}

/**
 * Revenue-first ordering scoring function (V9 spec §3.2).
 * 1. Monetized source first (gamemonetize)
 * 2. Category demand weight
 * 3. Session-depth weight
 * 4. Existing featured flag, then stable catalog order
 */
export function scoreGame(g, index = 0) {
  let s = 0;
  if (MONETIZED_SOURCES.has(g.source)) s += 100000;

  let maxCat = 0;
  for (const c of g.categories || []) {
    const w = CATEGORY_WEIGHTS[c] ?? DEFAULT_CAT_WEIGHT;
    if (w > maxCat) maxCat = w;
  }
  s += (maxCat || DEFAULT_CAT_WEIGHT);
  s += sessionDepthBonus(g);
  if (isHorror(g)) s -= 50000;
  if (g.featured) s += 20;
  s -= (index ?? 0) * 0.001;
  return s;
}

/**
 * Merged catalog accessor — orders all games revenue-first without dropping any.
 */
function mergeCatalogs(primary, extra) {
  const combined = [...extra, ...primary];
  const seenSlugs = new Set();
  const seenTitles = new Set();
  const raw = [];
  for (const g of combined) {
    const t = normTitle(g.title);
    if (seenSlugs.has(g.slug) || seenTitles.has(t)) continue;
    seenSlugs.add(g.slug);
    seenTitles.add(t);
    raw.push(g);
  }
  return raw.sort((a, b) => scoreGame(b) - scoreGame(a));
}

export const allGames = mergeCatalogs(gdGames, gmGames);

/** Join the Astro base path with a site-relative path. */
export function u(path = '') {
  const base = import.meta.env.BASE_URL || '/';
  return (base.endsWith('/') ? base : base + '/') + path.replace(/^\//, '');
}

export const gameUrl = (g) => u(`games/${g.slug}/`);

const hasCat = (g, cats) => (g.categories || []).some((c) => cats.includes(c));
const text = (g) => `${g.title} ${g.instructions} ${(g.tags || []).join(' ')}`;

/**
 * Builds the 12-tile Featured mosaic per spec §3.3:
 * - GM-led across driving, agility/runner, .io, sports, puzzle
 * - Both 2x2 hero tiles (indices 0 and 5) are strongest landscape GM titles
 * - Zero horror games in the 12
 */
function buildFeatured(games) {
  const gmSafe = games.filter(
    (g) => MONETIZED_SOURCES.has(g.source) && !isHorror(g) && !MARQUEE_EXCLUDE.has(g.slug),
  );
  const isLandscape = (g) => (g.width / g.height) >= 1.3;

  const hero0 = gmSafe.find(
    (g) => isLandscape(g) && hasCat(g, ['Racing & Driving', 'Agility']),
  );

  const hero5 = gmSafe.find(
    (g) => g !== hero0 && isLandscape(g) && hasCat(g, ['.IO', 'Sports', 'Football']),
  );

  const picked = new Set([hero0, hero5].filter(Boolean));

  const catGroups = [
    ['Agility'],
    ['Racing & Driving'],
    ['.IO'],
    ['Sports', 'Football'],
    ['Puzzle', 'Merge'],
  ];

  const slots = new Array(12);
  slots[0] = hero0;
  slots[5] = hero5;

  const remainingSlots = [1, 2, 3, 4, 6, 7, 8, 9, 10, 11];

  for (const group of catGroups) {
    const candidates = gmSafe.filter(
      (g) => !picked.has(g) && hasCat(g, group),
    );
    if (candidates[0]) picked.add(candidates[0]);
    if (candidates[1]) picked.add(candidates[1]);
  }

  const otherPicks = [...picked].filter((g) => g !== hero0 && g !== hero5);
  let rIdx = 0;
  for (const g of otherPicks) {
    if (rIdx < remainingSlots.length) {
      slots[remainingSlots[rIdx++]] = g;
    }
  }

  for (const g of gmSafe) {
    if (rIdx >= remainingSlots.length) break;
    if (!picked.has(g)) {
      picked.add(g);
      slots[remainingSlots[rIdx++]] = g;
    }
  }

  return slots;
}

/** Named shelves used by the home page and the hub pages. */
export const shelves = {
  featured: () => buildFeatured(allGames),
  newGames: () => allGames.slice(-12),
  halloween: () => {
    const slugs = new Set([
      'scary-granny-horror-maze-escape',
      'trick-or-treat-candy-carnival',
      'boo-chains',
      'spooky-boxing',
      'halloween-football-championship',
      'zombie-barrage',
      'shooter-soldiers-vs-zombies',
      'wheelie-spooky',
      'zombie-sprint',
      'monsters-wheels-2',
      'adopt-a-monster',
      'grim-spell',
      'deadfloor-factory',
      'tower-truck-zombie-siege',
      'ghost-hunt-spirit-scanner',
    ]);
    return allGames.filter((g) => slugs.has(g.slug));
  },
  popular: () => [...allGames].slice(0, 36),
  driving: () => allGames.filter((g) => hasCat(g, ['Racing & Driving'])),
  running: () =>
    allGames.filter(
      (g) => hasCat(g, ['Agility']) || /run|rush|dash|runner|endless|tunnel|slope/i.test(text(g)),
    ),
  math: () =>
    allGames.filter(
      (g) =>
        hasCat(g, ['Puzzle', 'Merge', 'Educational', 'Match-3', 'Cards', 'Mahjong & Connect', 'Boardgames', 'Quiz']) ||
        /2048|math|number|merge|count/i.test(g.title),
    ),
  io: () => {
    const list = allGames.filter((g) => hasCat(g, ['.IO']));
    const firstSafe = list.findIndex((g) => !MARQUEE_EXCLUDE.has(g.slug));
    if (firstSafe > 0) {
      const [fav] = list.splice(firstSafe, 1);
      list.unshift(fav);
    }
    return list;
  },
  sports: () => allGames.filter((g) => hasCat(g, ['Sports', 'Football'])),
  puzzle: () => allGames.filter((g) => hasCat(g, ['Puzzle', 'Merge', 'Match-3'])),
  breaks: () =>
    allGames.filter(
      (g) =>
        hasCat(g, ['Agility', 'Puzzle', 'Merge', 'Match-3']) ||
        /endless|runner|running|dash|slope|merge|puzzle|2048|tetris|tunnel/i.test(text(g)),
    ),
  twoPlayer: () => {
    const direct = allGames.filter((g) => /2 player|two player|multiplayer|1 ?vs ?1|versus/i.test(text(g)));
    const extra = allGames.filter(
      (g) => !direct.includes(g) && hasCat(g, ['Battle']) && /tennis|football|soccer|fight|battle|duel/i.test(text(g)),
    );
    return [...direct, ...extra].slice(0, 24);
  },
  logic: () =>
    allGames.filter((g) => hasCat(g, ['Puzzle', 'Strategy', 'Educational', 'Cards', 'Boardgames', 'Quiz', 'Merge'])),
  classroom: () => {
    const picks = [
      ...shelves.math().slice(0, 8),
      ...shelves.running().slice(0, 8),
      ...shelves.driving().slice(0, 6),
      ...shelves.io().slice(0, 6),
      ...shelves.sports().slice(0, 4),
    ];
    return [...new Map(picks.map((g) => [g.slug, g])).values()];
  },
  schoolMix: () => {
    const picks = [
      ...shelves.featured(),
      ...shelves.driving().slice(0, 6),
      ...shelves.running().slice(0, 6),
      ...shelves.math().slice(0, 6),
      ...shelves.io().slice(0, 5),
      ...shelves.sports().slice(0, 4),
      ...shelves.twoPlayer().slice(0, 4),
    ];
    return [...new Map(picks.map((g) => [g.slug, g])).values()].slice(0, 36);
  },
  best: () => {
    const picks = [
      ...shelves.featured(),
      ...shelves.driving().slice(0, 4),
      ...shelves.math().slice(0, 4),
      ...shelves.io().slice(0, 4),
      ...shelves.running().slice(0, 4),
    ];
    return [...new Map(picks.map((g) => [g.slug, g])).values()].slice(0, 30);
  },
};

/** Deterministic Game of the Day pick from top GM games */
export function getGameOfTheDay() {
  const pool = buildFeatured(allGames);
  const day = Math.floor(Date.now() / 86400000);
  return pool[day % pool.length] || allGames[0];
}

/** Related games: revenue-first within relevance (spec §2.4, §3.2) */
export function relatedGames(game, n = 6) {
  const scored = allGames
    .filter((g) => g.slug !== game.slug)
    .map((g) => ({
      g,
      relevance:
        (g.categories || []).filter((c) => (game.categories || []).includes(c)).length * 2 +
        (g.tags || []).filter((t) => (game.tags || []).includes(t)).length,
      revenue: scoreGame(g),
    }))
    .sort((a, b) => (b.relevance - a.relevance) || (b.revenue - a.revenue));
  return scored.slice(0, n).map((s) => s.g);
}

export function gameFaqs(game) {
  return [
    {
      q: `Is ${game.title} free to play?`,
      a: `Yes. ${game.title} is completely free to play on TabArcade. There are no downloads, no installs and no sign-up — the game loads in your browser and you can start playing right away.`,
    },
    {
      q: `Is ${game.title} unblocked at school?`,
      a: `${game.title} runs in a normal browser tab with nothing to install, so it works anywhere you can open TabArcade — including school Chromebooks on most networks.`,
    },
    {
      q: `Can I play ${game.title} on a Chromebook?`,
      a: `Yes. ${game.title} runs in a regular browser tab, so it works on school and home Chromebooks as well as Windows, Mac and Linux computers. Just open the page and press play — nothing needs to be installed.`,
    },
    {
      q: `Does ${game.title} work on phones and tablets?`,
      a: game.mobile
        ? `Yes. ${game.title} supports touch controls, so it works on phones and tablets as well as computers. For the biggest screen, use the fullscreen button above the game.`
        : `${game.title} plays in any modern mobile browser, but it is best enjoyed with a keyboard and a larger screen, for example on a Chromebook or laptop. Use the fullscreen button above the game for more room.`,
    },
  ];
}
