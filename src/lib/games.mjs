import gdGames from '../data/games.json';
import gmGames from '../data/games-gm.json';

export { gdGames, gmGames };

const normTitle = (s) => (s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

/**
 * Merged catalog accessor — the single place pages/components read games from.
 * GD games keep their order; GM games are interleaved (1 after every 4 GD
 * games) so they surface in home grids and hubs, not just on their own pages.
 * Duplicates lose to GD: a GM entry whose slug or normalized title is already
 * in the GD catalog (or earlier in the merge) is dropped.
 */
function mergeCatalogs(primary, extra) {
  const seenSlugs = new Set();
  const seenTitles = new Set();
  const keep = (g) => {
    const t = normTitle(g.title);
    if (seenSlugs.has(g.slug) || seenTitles.has(t)) return false;
    seenSlugs.add(g.slug);
    seenTitles.add(t);
    return true;
  };
  const out = [];
  let j = 0;
  primary.forEach((g, i) => {
    if (keep(g)) out.push(g);
    if ((i + 1) % 4 === 0 && j < extra.length) {
      const e = extra[j++];
      if (keep(e)) out.push(e);
    }
  });
  while (j < extra.length) {
    const e = extra[j++];
    if (keep(e)) out.push(e);
  }
  return out;
}

export const allGames = mergeCatalogs(gdGames, gmGames);

/** Join the Astro base path with a site-relative path. */
export function u(path = '') {
  const base = import.meta.env.BASE_URL || '/';
  return (base.endsWith('/') ? base : base + '/') + path.replace(/^\//, '');
}

export const gameUrl = (g) => u(`games/${g.slug}/`);

const hasCat = (g, cats) => g.categories.some((c) => cats.includes(c));
const text = (g) => `${g.title} ${g.instructions} ${g.tags.join(' ')}`;

/** Named shelves used by the home page and the hub pages. */
export const shelves = {
  featured: () => allGames.filter((g) => g.featured),
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
  io: () => allGames.filter((g) => hasCat(g, ['.IO'])),
  sports: () => allGames.filter((g) => hasCat(g, ['Sports', 'Football'])),
  puzzle: () => allGames.filter((g) => hasCat(g, ['Puzzle', 'Merge', 'Match-3'])),
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

export function relatedGames(game, n = 6) {
  const scored = allGames
    .filter((g) => g.slug !== game.slug)
    .map((g) => ({
      g,
      score:
        g.categories.filter((c) => game.categories.includes(c)).length * 2 +
        g.tags.filter((t) => game.tags.includes(t)).length,
    }))
    .sort((a, b) => b.score - a.score);
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
