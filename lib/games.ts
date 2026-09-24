import { useCallback, useEffect, useRef, useState } from "react";
import { axiosGet } from "./api";
import type {
  AiPerformance,
  GameMapsPlayerStats,
  GamePlayerStats,
  GameSideInfo,
  GameStats,
  League,
  Team,
} from "./types";


type Status = "finished" | "upcoming";

const sortGames = (games: GameStats[], status: Status) =>
  [...games].sort((a, b) =>
    status === "finished"
      ? b.start_timestamp - a.start_timestamp
      : a.start_timestamp - b.start_timestamp
  );


export function useGames(status: Status, period = "last_15", league?: string) {
  const [games, setGames] = useState<GameStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    const query =
      status === "finished"
        ? league
          ? `?league=${league}`
          : `?period=${period}`
        : "/upcoming";

    await axiosGet(
      `/games_stats${query}`,
      (data) => setGames(sortGames(data.games ?? [], status)),
      () => setError(true),
      true
    );
    setLoading(false);
  }, [status, period, league]);

  useEffect(() => {
    load();
  }, [load]);

  return { games, loading, error, reload: load };
}


export function useCurrentGames(intervalMs = 180000) {
  const [games, setGames] = useState<GameStats[]>([]);
  const saved = useRef(intervalMs);

  useEffect(() => {
    let active = true;
    const fetchGames = () =>
      axiosGet(
        `/games_stats/current`,
        (data) => active && setGames(data.games ?? []),
        () => {},
        true
      );

    fetchGames();
    const id = setInterval(fetchGames, saved.current);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  return games;
}


export function useAiPerformance() {
  const [games, setGames] = useState<AiPerformance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosGet(
      `/ai_performance`,
      (data) => {
        setGames(data?.games ?? data ?? []);
        setLoading(false);
      },
      () => setLoading(false),
      true
    );
  }, []);

  const total = games.length;
  const winnerHits = games.filter((g) => g.win_result).length;
  const exactHits = games.filter((g) => g.exact_result).length;

  return { games, loading, total, winnerHits, exactHits };
}


export function useGame(slug?: string, selectedMap?: string | null) {
  const [game, setGame] = useState<GameStats | null>(null);
  const [players, setPlayers] = useState<GamePlayerStats[]>([]);
  const [mapPlayers, setMapPlayers] = useState<GameMapsPlayerStats[]>([]);
  const [sides, setSides] = useState<GameSideInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setNotFound(false);

    axiosGet(
      `/games_stats/game?slug=${slug}`,
      (data) => {
        setGame(data ?? null);
        setLoading(false);
      },
      () => {
        setNotFound(true);
        setLoading(false);
      },
      true
    );
  }, [slug]);

  useEffect(() => {
    if (!slug || game?.status !== "finished") return;

    const getStats = (full: string, short: string, apply: (rows: any) => void) =>
      axiosGet(
        `/games_stats/game_info?slug=${slug}&game_stat=${full}`,
        (data) => {
          const rows = data?.[full] ?? [];
          if (rows.length) return apply(rows);
          axiosGet(
            `/games_stats/game_info?slug=${slug}&game_stat=${short}`,
            (data2) => apply(data2?.[short] ?? []),
            () => {},
            true
          );
        },
        () => {},
        true
      );

    getStats("players_stats", "short_players_stats", setPlayers);
    getStats("maps_players_stats", "short_maps_players_stats", setMapPlayers);

    axiosGet(
      `/games_stats/game_info?slug=${slug}&game_stat=game_side_stats`,
      (data) => setSides(data?.game_side_stats ?? []),
      () => {},
      true
    );
  }, [slug, game?.status]);

  const visiblePlayers = selectedMap
    ? (mapPlayers.find((m) => m.map_name === selectedMap)?.players_stats ?? [])
    : players;

  return { game, players: visiblePlayers, sides, loading, notFound };
}


export function useFilters() {
  const [periods, setPeriods] = useState<string[]>([]);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);

  useEffect(() => {
    axiosGet(`/games_stats/periods`, (data) => setPeriods(data ?? []), () => {}, true);
    axiosGet(
      `/games_stats/leagues`,
      (data) =>
        setLeagues([...(data ?? [])].sort((a, b) => b.start_timestamp - a.start_timestamp)),
      () => {},
      true
    );
    axiosGet(
      `/games_stats/teams`,
      (data) => setTeams([...(data ?? [])].sort((a, b) => a.slug.localeCompare(b.slug))),
      () => {},
      true
    );
  }, []);

  return { periods, leagues, teams };
}


export function usePagination<T>(items: T[], step = 10) {
  const [count, setCount] = useState(step);

  useEffect(() => {
    setCount(step);
  }, [items, step]);

  const showMore = useCallback(() => {
    setCount((c) => (c >= items.length ? c : c + step));
  }, [items.length, step]);

  return {
    visible: items.slice(0, count),
    hasMore: count < items.length,
    showMore,
  };
}


const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

export const periodLabel = (value: string) => {
  if (value === "last_15") return "Últimos 15 dias";
  const [year, month] = value.split("-");
  const index = parseInt(month, 10) - 1;
  return index >= 0 && index < 12 ? `${MONTHS[index]} ${year}` : value;
};
