import { useCallback, useEffect, useRef, useState } from "react";
import { axiosGet } from "./api";
import type { GameStats, LeagueStats } from "./types";


export type LeagueStatus = "finished" | "current";
export type Tier = "s-a" | "s" | "a";

export const TIER_OPTIONS: { label: string; value: Tier }[] = [
  { label: "Tier S e A", value: "s-a" },
  { label: "Tier S", value: "s" },
  { label: "Tier A", value: "a" },
];


export function yearOptions() {
  const current = new Date().getFullYear();
  return Array.from({ length: current - 2019 }, (_, i) => String(2020 + i)).reverse();
}


export function useLeagues(status: LeagueStatus, years: string[]) {
  const [leagues, setLeagues] = useState<LeagueStats[]>([]);
  const [upcoming, setUpcoming] = useState<LeagueStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const yearsKey = years.join(",");

  const load = useCallback(async () => {
    if (!years.length) {
      setLeagues([]);
      setUpcoming([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(false);
    const yearsParam = encodeURIComponent(JSON.stringify(years));

    const fetchByStatus = (value: string, apply: (rows: LeagueStats[]) => void) =>
      axiosGet(
        `/leagues_stats?status=${value}&years=${yearsParam}`,
        (data) => apply(data?.leagues ?? []),
        () => setError(true),
        true
      );

    await fetchByStatus(status, setLeagues);
    if (status === "current") await fetchByStatus("upcoming", setUpcoming);
    else setUpcoming([]);

    setLoading(false);
  }, [status, yearsKey]);

  useEffect(() => {
    load();
  }, [load]);

  return { leagues, upcoming, loading, error, reload: load };
}

export function filterLeagues(
  leagues: LeagueStats[],
  { search, tier, status }: { search: string; tier: Tier; status: LeagueStatus }
) {
  const query = search.trim().toLowerCase();

  let result = query
    ? leagues.filter((l) =>
        [l.name, l.slug, l.start_date]
          .filter(Boolean)
          .some((v) => v!.toLowerCase().includes(query))
      )
    : leagues;

  if (tier !== "s-a") result = result.filter((l) => l.tier === tier);

  const direction = status === "finished" ? -1 : 1;
  return [...result].sort(
    (a, b) => direction * ((a.start_timestamp ?? 0) - (b.start_timestamp ?? 0))
  );
}

export function useLeague(slug?: string) {
  const [league, setLeague] = useState<LeagueStats | null>(null);
  const [finished, setFinished] = useState<GameStats[]>([]);
  const [upcoming, setUpcoming] = useState<GameStats[]>([]);
  const [hasLive, setHasLive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;

    setLoading(true);
    setNotFound(false);
    setLeague(null);
    setFinished([]);
    setUpcoming([]);

    axiosGet(
      `/leagues_stats/league?slug=${slug}`,
      (data) => {
        setLeague(data ?? null);
        setLoading(false);
      },
      () => {
        setNotFound(true);
        setLoading(false);
      },
      true
    );

    const getGames = (status: "finished" | "upcoming", apply: (g: GameStats[]) => void) =>
      axiosGet(
        `/leagues_stats/${status}?slug=${slug}`,
        (data) => {
          const games: GameStats[] = data?.games ?? [];
          apply(
            [...games].sort((a, b) =>
              status === "finished"
                ? b.start_timestamp - a.start_timestamp
                : a.start_timestamp - b.start_timestamp
            )
          );
        },
        () => {},
        true
      );

    getGames("finished", setFinished);
    getGames("upcoming", setUpcoming);
  }, [slug]);

  const active = useRef(true);
  useEffect(() => {
    if (!slug) return;
    active.current = true;

    const check = () =>
      axiosGet(
        `/leagues_stats/current?slug=${slug}`,
        (data) => active.current && setHasLive(Boolean(data?.current)),
        () => {},
        true
      );

    check();
    const id = setInterval(check, 180000);
    return () => {
      active.current = false;
      clearInterval(id);
    };
  }, [slug]);

  return { league, finished, upcoming, hasLive, loading, notFound };
}

export function stageOptions(...lists: GameStats[][]) {
  const rounds = lists
    .flat()
    .map((g) => g.stage_round?.round)
    .filter((r): r is string => Boolean(r));

  return [...new Set(rounds)];
}
