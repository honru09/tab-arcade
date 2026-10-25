import games from '../data/games.json';

export const allGames = games;

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
