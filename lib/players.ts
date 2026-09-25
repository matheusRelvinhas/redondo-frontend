import { useEffect, useState } from "react";
import { axiosGet } from "./api";


export interface PlayerStats {
  id: number;
  slug: string | null;
  nickname: string;
  first_name: string | null;
  last_name: string | null;
  country: string | null;
  country_code: string | null;
  img_url: string | null;
  team_slug: string | null;
  team_name: string | null;
  team_img_url: string | null;
  team_rank: number | null;
  team_points: number | null;
  period?: string | null;

  games_count: number | null;
  avg_player_rating: number | null;
  avg_kills: number | null;
  avg_death: number | null;
  avg_assists: number | null;
  avg_damage: number | null;
  avg_first_kills: number | null;
  avg_first_death: number | null;
  avg_trade_kills: number | null;
  avg_flash_assists: number | null;
  avg_flash_hits: number | null;
  avg_flash_duration: number | null;
  avg_he_damage: number | null;
  avg_molotov_damage: number | null;
  avg_ak47_kills: number | null;
  avg_ak47_damage: number | null;
  avg_awp_kills: number | null;
  avg_awp_damage: number | null;
  avg_m4a1_kills: number | null;
  avg_m4a1_damage: number | null;
  avg_desert_eagle_kills: number | null;
  avg_desert_eagle_damage: number | null;
  avg_glock_kills: number | null;
  avg_glock_damage: number | null;
  avg_usp_s_kills: number | null;
  avg_usp_s_damage: number | null;
  multikills_vs_2: number | null;
  multikills_vs_3: number | null;
  multikills_vs_4: number | null;
  multikills_vs_5: number | null;
  clutches_vs_1: number | null;
  clutches_vs_2: number | null;
  clutches_vs_3: number | null;
  clutches_vs_4: number | null;
  clutches_vs_5: number | null;
}

export type StatKey = {
  [K in keyof PlayerStats]-?: PlayerStats[K] extends number | null ? K : never;
}[keyof PlayerStats];

export type ColumnKey = StatKey | "period";

export interface PlayerInfo {
  slug: string | null;
  nickname: string | null;
  first_name: string | null;
  last_name: string | null;
  team_slug: string | null;
  team_name: string | null;
  team_img_url: string | null;
  team_rank: number | null;
  team_points: number | null;
  country_code: string | null;
  img_url: string | null;
  stats: PlayerStats[];
}

export const PERIOD_OPTIONS = [
  { label: "Último mês", value: "last_month", months: 1 },
  { label: "Últimos 3 meses", value: "3_months", months: 3 },
  { label: "Últimos 6 meses", value: "6_months", months: 6 },
  { label: "Últimos 12 meses", value: "12_months", months: 12 },
];

export const DEFAULT_PERIOD = "6_months";
export const DEFAULT_GAME_COUNT = "25";

export const GAME_COUNT_OPTIONS = ["5", "10", "25", "50", "100"].map((v) => ({
  label: `${v} mapas`,
  value: v,
}));

export const periodText = (period: string | number) => {
  const value = String(period);
  const option = PERIOD_OPTIONS.find(
    (p) => p.value === value || String(p.months) === value
  );
  return option?.label ?? value;
};

export const STAT_GROUPS: { title: string; stats: StatKey[] }[] = [
  { title: "Geral", stats: ["avg_kills", "avg_death", "avg_assists", "avg_damage"] },
  {
    title: "Desempenho",
    stats: ["avg_first_kills", "avg_first_death", "avg_trade_kills", "games_count"],
  },
  {
    title: "Utilitárias",
    stats: [
      "avg_flash_assists",
      "avg_flash_hits",
      "avg_flash_duration",
      "avg_he_damage",
      "avg_molotov_damage",
    ],
  },
  {
    title: "Rifles",
    stats: [
      "avg_ak47_kills",
      "avg_ak47_damage",
      "avg_awp_kills",
      "avg_awp_damage",
      "avg_m4a1_kills",
      "avg_m4a1_damage",
    ],
  },
  {
    title: "Pistolas",
    stats: [
      "avg_desert_eagle_kills",
      "avg_desert_eagle_damage",
      "avg_glock_kills",
      "avg_glock_damage",
      "avg_usp_s_kills",
      "avg_usp_s_damage",
    ],
  },
  {
    title: "Multikills",
    stats: ["multikills_vs_5", "multikills_vs_4", "multikills_vs_3", "multikills_vs_2"],
  },
  {
    title: "Clutches",
    stats: [
      "clutches_vs_5",
      "clutches_vs_4",
      "clutches_vs_3",
      "clutches_vs_2",
      "clutches_vs_1",
    ],
  },
];

const STAT_LABELS: Partial<Record<ColumnKey, string>> = {
  period: "Período",
  avg_player_rating: "Rating",
  avg_kills: "K",
  avg_death: "D",
  avg_assists: "A",
  avg_damage: "ADR",
  games_count: "MP",
  avg_first_kills: "FK",
  avg_first_death: "FD",
  avg_trade_kills: "TK",
  avg_flash_assists: "FA",
  avg_flash_hits: "FH",
  avg_flash_duration: "FT",
  avg_he_damage: "HE",
  avg_molotov_damage: "MOL",
  avg_ak47_kills: "AK K",
  avg_ak47_damage: "AK DMG",
  avg_awp_kills: "AWP K",
  avg_awp_damage: "AWP DMG",
  avg_m4a1_kills: "M4 K",
  avg_m4a1_damage: "M4 DMG",
  avg_desert_eagle_kills: "DE K",
  avg_desert_eagle_damage: "DE DMG",
  avg_glock_kills: "GLK K",
  avg_glock_damage: "GLK DMG",
  avg_usp_s_kills: "USP K",
  avg_usp_s_damage: "USP DMG",
  multikills_vs_5: "5K",
  multikills_vs_4: "4K",
  multikills_vs_3: "3K",
  multikills_vs_2: "2K",
  clutches_vs_5: "1v5",
  clutches_vs_4: "1v4",
  clutches_vs_3: "1v3",
  clutches_vs_2: "1v2",
  clutches_vs_1: "1v1",
};

export const statLabel = (key: ColumnKey) => STAT_LABELS[key] ?? key;

const STAT_HINTS: Partial<Record<ColumnKey, string>> = {
  period: "período dos dados",
  avg_player_rating: "rating médio, desempenho geral (0–5)",
  avg_kills: "média de kills por round",
  avg_death: "média de mortes por round",
  avg_assists: "média de assistências por round",
  avg_damage: "dano médio por round",
  games_count: "mapas jogados",
  avg_first_kills: "média de primeiras kills por round",
  avg_first_death: "média de primeiras mortes por round",
  avg_trade_kills: "média de trade kills por round",
  avg_flash_assists: "média de assistências com flash por round",
  avg_flash_hits: "média de inimigos cegados por round",
  avg_flash_duration: "tempo médio de cegueira causada, em segundos",
  avg_he_damage: "dano médio de granada HE por round",
  avg_molotov_damage: "dano médio de molotov por round",
  avg_ak47_kills: "média de kills com AK47 por round",
  avg_ak47_damage: "dano médio com AK47 por round",
  avg_awp_kills: "média de kills com AWP por round",
  avg_awp_damage: "dano médio com AWP por round",
  avg_m4a1_kills: "média de kills com M4A1 por round",
  avg_m4a1_damage: "dano médio com M4A1 por round",
  avg_desert_eagle_kills: "média de kills com Desert Eagle por round",
  avg_desert_eagle_damage: "dano médio com Desert Eagle por round",
  avg_glock_kills: "média de kills com Glock por round",
  avg_glock_damage: "dano médio com Glock por round",
  avg_usp_s_kills: "média de kills com USP-S por round",
  avg_usp_s_damage: "dano médio com USP-S por round",
  multikills_vs_5: "rounds com 5 kills",
  multikills_vs_4: "rounds com 4 kills",
  multikills_vs_3: "rounds com 3 kills",
  multikills_vs_2: "rounds com 2 kills",
  clutches_vs_5: "clutches vencidos contra 5 inimigos",
  clutches_vs_4: "clutches vencidos contra 4 inimigos",
  clutches_vs_3: "clutches vencidos contra 3 inimigos",
  clutches_vs_2: "clutches vencidos contra 2 inimigos",
  clutches_vs_1: "clutches vencidos contra 1 inimigo",
};

export const statHint = (key: ColumnKey) => STAT_HINTS[key] ?? "";

const COUNT_STATS: ColumnKey[] = [
  "games_count",
  "multikills_vs_5",
  "multikills_vs_4",
  "multikills_vs_3",
  "multikills_vs_2",
  "clutches_vs_5",
  "clutches_vs_4",
  "clutches_vs_3",
  "clutches_vs_2",
  "clutches_vs_1",
];

const PRECISE_STATS: ColumnKey[] = [
  "avg_first_kills",
  "avg_first_death",
  "avg_trade_kills",
  "avg_assists",
  "avg_flash_assists",
  "avg_ak47_kills",
  "avg_awp_kills",
  "avg_m4a1_kills",
  "avg_desert_eagle_kills",
  "avg_glock_kills",
  "avg_usp_s_kills",
];

export function formatStat(key: ColumnKey, value: number) {
  if (key === "period") return periodText(value);
  if (COUNT_STATS.includes(key)) return value.toFixed(0);
  if (PRECISE_STATS.includes(key)) return value.toFixed(3);
  if (key === "avg_flash_duration") return (value / 1_000_000_000).toFixed(2);
  return value.toFixed(2);
}

export function statValue(row: PlayerStats, key: ColumnKey): number | null {
  const raw = row[key as keyof PlayerStats];
  if (raw === null || raw === undefined) return null;
  const n = Number(raw);
  return Number.isNaN(n) ? null : n;
}

export function sortPlayers(rows: PlayerStats[], key: ColumnKey, desc: boolean) {
  return [...rows].sort((a, b) => {
    const av = statValue(a, key) ?? 0;
    const bv = statValue(b, key) ?? 0;
    return desc ? bv - av : av - bv;
  });
}

export function filterPlayers(
  players: PlayerStats[],
  { search, countries, teams }: { search: string; countries: string[]; teams: string[] }
) {
  const query = search.trim().toLowerCase();

  let result = query
    ? players.filter((p) =>
        [
          p.nickname,
          p.first_name,
          p.last_name,
          p.slug,
          p.team_name,
          p.team_slug,
          p.country,
          p.country_code,
        ]
          .filter(Boolean)
          .some((v) => v!.toLowerCase().includes(query))
      )
    : players;

  if (countries.length)
    result = result.filter((p) => p.country_code && countries.includes(p.country_code));
  if (teams.length)
    result = result.filter((p) => p.team_slug && teams.includes(p.team_slug));

  return result;
}

const uniqueOptions = (
  players: PlayerStats[],
  pick: (p: PlayerStats) => [string | null, string | null]
) => {
  const map = new Map<string, string>();
  players.forEach((p) => {
    const [value, label] = pick(p);
    if (value && label) map.set(value, label);
  });
  return [...map]
    .map(([value, label]) => ({ value, label }))
    .sort((a, b) => a.label.localeCompare(b.label));
};

export const countryOptions = (players: PlayerStats[]) =>
  uniqueOptions(players, (p) => [p.country_code, p.country]);

export const teamOptions = (players: PlayerStats[]) =>
  uniqueOptions(players, (p) => [p.team_slug, p.team_name]);

export function usePlayers(period: string, gameCount: string) {
  const [players, setPlayers] = useState<PlayerStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(false);

    axiosGet(
      `/player_stats?period=${period}&game_count=${gameCount}`,
      (data) => {
        if (!active) return;
        setPlayers(data?.players ?? []);
        setLoading(false);
      },
      () => {
        if (!active) return;
        setError(true);
        setLoading(false);
      },
      true
    );

    return () => {
      active = false;
    };
  }, [period, gameCount]);

  return { players, loading, error };
}

export function usePlayer(slug?: string) {
  const [player, setPlayer] = useState<PlayerInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;

    let active = true;
    setLoading(true);
    setNotFound(false);
    setPlayer(null);

    axiosGet(
      `/player_stats/player?slug=${slug}`,
      (data) => {
        if (!active) return;
        setPlayer(data ?? null);
        setLoading(false);
      },
      () => {
        if (!active) return;
        setNotFound(true);
        setLoading(false);
      },
      true
    );

    return () => {
      active = false;
    };
  }, [slug]);

  return { player, loading, notFound };
}
