import { useEffect, useState } from "react";
import { axiosGet } from "./api";
import type { PlayerStats } from "./players";
import type { GameScore, GameStats, LeagueStats } from "./types";


export interface TeamStats {
  id: number;
  slug: string;
  team_name: string;
  img_url: string | null;
  country_code: string | null;
  country_name: string | null;
  region_code: string | null;
  points: number | null;
  rank: number | null;
}

export interface TeamMap extends GameScore {
  game_slug: string;
  start_timestamp: number;
  team1_name: string | null;
  team2_name: string | null;
  team1_slug: string | null;
  team2_slug: string | null;
  team1_img_url: string | null;
  team2_img_url: string | null;
}

export type Period = "last_month" | "3_months" | "6_months" | "12_months";

export type TeamPlayer = { slug: string } & Record<Period, PlayerStats | null>;

export interface TeamInfo {
  team: TeamStats;
  games: GameStats[];
  maps: TeamMap[];
  leagues: LeagueStats[];
  players: TeamPlayer[];
}

export const REGIONS = [
  { label: "Mundial", value: "all" },
  { label: "América", value: "AM" },
  { label: "Europa", value: "EU" },
  { label: "Ásia", value: "AS" },
] as const;

export type Region = (typeof REGIONS)[number]["value"];

const PERIOD_SECONDS: Record<Period, number> = {
  last_month: 30 * 24 * 60 * 60,
  "3_months": 91 * 24 * 60 * 60,
  "6_months": 182 * 24 * 60 * 60,
  "12_months": 365 * 24 * 60 * 60,
};

/** Timestamp a partir do qual uma partida entra no período escolhido. */
export const periodStart = (period: Period) =>
  Math.floor(Date.now() / 1000) - PERIOD_SECONDS[period];

/** Total, vitórias, derrotas e aproveitamento — o performanceGrid do project-x. */
export function record(total: number, wins: number) {
  return {
    total,
    wins,
    losses: total - wins,
    performance: total ? Math.round((wins * 100) / total) : 0,
  };
}

export function useTeams(region: Region) {
  const [teams, setTeams] = useState<TeamStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(false);

    axiosGet(
      `/teams_stats?region_code=${region}`,
      (data) => {
        if (!active) return;
        setTeams(data?.teams ?? []);
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
  }, [region]);

  return { teams, loading, error };
}

export function useTeam(slug?: string) {
  const [info, setInfo] = useState<TeamInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;

    let active = true;
    setLoading(true);
    setNotFound(false);
    setInfo(null);

    axiosGet(
      `/teams_stats/team?slug=${slug}`,
      (data) => {
        if (!active) return;
        setInfo(data?.team ? data : null);
        setNotFound(!data?.team);
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

  return { info, loading, notFound };
}

export function filterTeams(
  teams: TeamStats[],
  { search, countries }: { search: string; countries: string[] }
) {
  const query = search.trim().toLowerCase();

  let result = query
    ? teams.filter((t) =>
        [t.team_name, t.slug, t.country_name]
          .filter(Boolean)
          .some((v) => v!.toLowerCase().includes(query))
      )
    : teams;

  if (countries.length)
    result = result.filter((t) => t.country_code && countries.includes(t.country_code));

  // o ranking da Valve é a ordem natural da lista
  return [...result].sort((a, b) => (b.points ?? 0) - (a.points ?? 0));
}

/** Países presentes na lista, para o filtro. */
export function countryOptions(teams: TeamStats[]) {
  const map = new Map<string, string>();
  teams.forEach((t) => {
    if (t.country_code && t.country_name) map.set(t.country_code, t.country_name);
  });
  return [...map]
    .map(([value, label]) => ({ value, label }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

/** Posição de cada time dentro da própria região — o getRegionRank do project-x. */
export function regionRanks(teams: TeamStats[]) {
  const byRegion = new Map<string, TeamStats[]>();

  teams.forEach((t) => {
    if (!t.region_code || t.points === null) return;
    const list = byRegion.get(t.region_code) ?? [];
    list.push(t);
    byRegion.set(t.region_code, list);
  });

  const ranks = new Map<string, number>();
  byRegion.forEach((list) => {
    [...list]
      .sort((a, b) => (b.points ?? 0) - (a.points ?? 0))
      .forEach((t, i) => ranks.set(t.slug, i + 1));
  });

  return ranks;
}
