export const SITE = {
  name: "REDONDO STATS",
  url: (process.env.EXPO_PUBLIC_FRONTEND_URL ?? "https://redondostats.site").replace(
    /\/$/,
    ""
  ),
  description:
    "REDONDO STATS é uma plataforma de estatísticas avançadas de Counter-Strike 2. Analise jogadores, times, campeonatos e partidas com métricas detalhadas e insights competitivos.",
  email: "contato@redondostats.site",
  telephone: "+55-31-97145-1910",
  image: "/logo.png",
};

export const absoluteUrl = (path: string) =>
  path.startsWith("http") ? path : `${SITE.url}${path.startsWith("/") ? path : `/${path}`}`;

export const pageTitle = (title?: string) =>
  title ? `${title} | ${SITE.name}` : SITE.name;

export const titleFromSlug = (slug: string) =>
  slug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

export const titleFromGameSlug = (slug: string) =>
  slug
    .replace(/(\d{2})-(\d{2})-(\d{4})$/, "$1/$2/$3")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase())
    .replace(/\bRs\b/g, "X");

const BASE_KEYWORDS = [
  "cs2 stats", "counter strike 2 stats", "estatísticas cs2", "cs2 analytics",
  "cs2 esports stats", "counter strike 2 analytics", "estatísticas counter strike 2",
  "cs2 statistics", "redondo stats",
];

const GAME_KEYWORDS = [
  "cs2 matches", "counter strike 2 matches", "cs2 match statistics", "cs2 game stats",
  "cs2 results", "cs2 match analytics", "counter strike 2 game statistics",
  "cs2 map statistics", "cs2 rounds stats", "cs2 match results", "cs2 pro matches",
  "cs2 esports matches", "cs2 match history", "counter strike 2 results",
  "cs2 competitive matches", "cs2 game analytics", "cs2 match insights",
  "cs2 team match stats", "cs2 match breakdown", "cs2 jogos", "cs2 partidas",
  "counter strike 2 partidas", "cs2 resultados", "estatísticas partidas cs2",
  "cs2 mapas estatísticas", "cs2 jogos profissionais", "cs2 esports partidas",
  "counter strike 2 resultados", "cs2 partidas competitivas", "cs2 análise partidas",
  "cs2 desempenho times",
];

const TEAM_KEYWORDS = [
  "cs2 teams", "counter strike 2 teams", "cs2 team stats", "cs2 esports teams",
  "cs2 professional teams", "counter strike 2 team statistics", "cs2 team rankings",
  "cs2 team analytics", "cs2 team performance", "cs2 team results", "cs2 team matches",
  "cs2 team roster", "cs2 esports organizations", "cs2 pro teams", "cs2 competitive teams",
  "cs2 lineup", "times cs2", "equipes cs2", "times counter strike 2",
  "estatísticas times cs2", "estatísticas equipes cs2", "times profissionais cs2",
  "ranking times cs2", "análise times cs2", "desempenho equipes cs2",
  "resultados times cs2", "partidas times cs2", "lineup times cs2", "elenco times cs2",
  "organizações esports cs2", "times competitivos cs2",
];

const LEAGUE_KEYWORDS = [
  "cs2 tournaments", "counter strike 2 tournaments", "cs2 leagues",
  "counter strike 2 leagues", "cs2 esports tournaments", "cs2 tournament stats",
  "cs2 league statistics", "cs2 esports events", "cs2 competitions",
  "counter strike 2 competitions", "cs2 professional tournaments",
  "cs2 event statistics", "cs2 tournament analytics", "campeonatos cs2", "torneios cs2",
  "ligas cs2", "campeonatos counter strike 2", "torneios counter strike 2",
  "estatísticas campeonatos cs2", "estatísticas torneios cs2", "eventos esports cs2",
  "competições cs2", "ligas esports cs2",
];

const PLAYER_KEYWORDS = [
  "cs2 players", "counter strike 2 players", "cs2 player stats", "cs2 pro players",
  "counter strike 2 player statistics", "cs2 esports players", "cs2 player rankings",
  "cs2 player analytics", "cs2 professional players", "counter strike 2 pro players",
  "cs2 player performance", "cs2 esports player statistics", "jogadores cs2",
  "jogadores counter strike 2", "estatísticas jogadores cs2", "jogadores profissionais cs2",
  "ranking jogadores cs2", "estatísticas pro players cs2", "análise jogadores cs2",
  "performance jogadores cs2",
];

export interface PageSeo {
  title: string;
  description: string;
  keywords: string[];
  path: string;
}

const isTemplate = (slug: string) => !slug || slug.includes("[");

const withBase = (keywords: string[]) => [...keywords, ...BASE_KEYWORDS];

export const homeSeo = (): PageSeo => ({
  title: "Estatísticas de CS2, Jogos, Times e Jogadores",
  description: SITE.description,
  keywords: withBase([...GAME_KEYWORDS.slice(0, 8), ...TEAM_KEYWORDS.slice(0, 8), ...PLAYER_KEYWORDS.slice(0, 8)]),
  path: "/",
});

export const gamesSeo = (): PageSeo => ({
  title: "Jogos e Estatísticas de CS2",
  description:
    "Explore estatísticas detalhadas de partidas de Counter-Strike 2 no REDONDO STATS. Analise jogos, resultados, mapas, rounds e desempenho de times em partidas profissionais de CS2.",
  keywords: withBase(GAME_KEYWORDS),
  path: "/games",
});

export const gameSeo = (slug: string): PageSeo => {
  if (isTemplate(slug)) return { ...gamesSeo(), path: "" };

  const title = titleFromGameSlug(slug);
  return {
    title,
    description: `Explore estatísticas detalhadas do jogo ${title}, Counter-Strike 2 no REDONDO STATS.`,
    keywords: withBase([slug, title, ...GAME_KEYWORDS]),
    path: `/game/${slug}`,
  };
};

export const teamsSeo = (): PageSeo => ({
  title: "Times de CS2 e Estatísticas das Equipes",
  description:
    "Explore times profissionais de Counter-Strike 2 no REDONDO STATS. Veja estatísticas das equipes, lineups, jogadores, partidas, resultados e desempenho no cenário competitivo de CS2.",
  keywords: withBase(TEAM_KEYWORDS),
  path: "/teams",
});

export const teamSeo = (slug: string): PageSeo => {
  if (isTemplate(slug)) return { ...teamsSeo(), path: "" };

  const title = titleFromSlug(slug);
  return {
    title,
    description: `Veja estatísticas completas do time ${title} no Counter-Strike 2. Confira jogadores, partidas, resultados, mapas e desempenho da equipe no REDONDO STATS.`,
    keywords: withBase([slug, title, ...TEAM_KEYWORDS]),
    path: `/team/${slug}`,
  };
};

export const leaguesSeo = (): PageSeo => ({
  title: "Campeonatos e Estatísticas de CS2",
  description:
    "Explore campeonatos de Counter-Strike 2 no REDONDO STATS. Veja estatísticas de torneios, ligas, times participantes, resultados e desempenho em competições de CS2.",
  keywords: withBase(LEAGUE_KEYWORDS),
  path: "/leagues",
});

export const leagueSeo = (slug: string): PageSeo => {
  if (isTemplate(slug)) return { ...leaguesSeo(), path: "" };

  const title = titleFromSlug(slug);
  return {
    title,
    description: `Explore estatísticas completas do campeonato ${title} de Counter-Strike 2. Veja times participantes, partidas, resultados, mapas e desempenho das equipes no REDONDO STATS.`,
    keywords: withBase([slug, title, ...LEAGUE_KEYWORDS]),
    path: `/league/${slug}`,
  };
};

export const playersSeo = (): PageSeo => ({
  title: "Jogadores e Estatísticas de CS2",
  description:
    "Explore jogadores profissionais de Counter-Strike 2 no REDONDO STATS. Analise estatísticas, desempenho, rankings, histórico de partidas e métricas avançadas do cenário de CS2.",
  keywords: withBase(PLAYER_KEYWORDS),
  path: "/players",
});

export const playerSeo = (slug: string): PageSeo => {
  if (isTemplate(slug)) return { ...playersSeo(), path: "" };

  const title = titleFromSlug(slug);
  return {
    title,
    description: `Explore as estatísticas completas do jogador ${title} em Counter-Strike 2 no REDONDO STATS. Veja performance, histórico de partidas, mapas jogados e métricas avançadas de jogadores profissionais de CS2.`,
    keywords: withBase([slug, title, ...PLAYER_KEYWORDS]),
    path: `/player/${slug}`,
  };
};

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE.name,
  url: SITE.url,
  logo: absoluteUrl(SITE.image),
  description: SITE.description,
  email: SITE.email,
  telephone: SITE.telephone,
};
