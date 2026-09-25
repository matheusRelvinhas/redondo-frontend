import { useMemo, useState } from "react";
import { View, Text, Pressable } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "@/components/screen";
import { Seo } from "@/components/seo";
import { teamSeo } from "@/lib/seo";
import { Panel, Chip, Eyebrow, FormDots, PillTabs, RecordStrip } from "@/components/ui";
import { TeamImage } from "@/components/entity-image";
import { GameList } from "@/components/game-card";
import { LeagueList } from "@/components/league-card";
import { MapList } from "@/components/map-card";
import {
  PlayerStatsTable,
  StatGroupTabs,
  StatsLegend,
} from "@/components/player-stats-table";
import { PrimaryGlow } from "@/components/primary-glow";
import { Select } from "@/components/select";
import { usePagination } from "@/lib/games";
import { mapName } from "@/lib/format";
import {
  PERIOD_OPTIONS,
  STAT_GROUPS,
  sortPlayers,
  type ColumnKey,
  type PlayerStats,
} from "@/lib/players";
import { periodStart, record, useTeam, type Period } from "@/lib/teams";

const TABS = [
  { label: "Jogos", value: "games" },
  { label: "Mapas", value: "maps" },
  { label: "Campeonatos", value: "leagues" },
  { label: "Jogadores", value: "players" },
] as const;

type Tab = (typeof TABS)[number]["value"];

const BO_OPTIONS = [
  { label: "Bo1", value: "1" },
  { label: "Bo3", value: "3" },
  { label: "Bo5", value: "5" },
];

export default function TeamScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { info, loading, notFound } = useTeam(slug);

  const [period, setPeriod] = useState<Period>("6_months");
  const [tab, setTab] = useState<Tab>("games");

  const [boType, setBoType] = useState<string | null>(null);
  const [opponent, setOpponent] = useState<string | null>(null);
  const [mapFilter, setMapFilter] = useState<string | null>(null);
  const [mapOpponent, setMapOpponent] = useState<string | null>(null);

  const [group, setGroup] = useState(STAT_GROUPS[0]);
  const [sort, setSort] = useState<ColumnKey>("avg_player_rating");
  const [desc, setDesc] = useState(true);

  const since = useMemo(() => periodStart(period), [period]);

  const games = useMemo(() => {
    let rows = (info?.games ?? [])
      .filter((g) => g.start_timestamp >= since)
      .sort((a, b) => b.start_timestamp - a.start_timestamp);
    if (boType) rows = rows.filter((g) => g.bo_type === Number(boType));
    if (opponent)
      rows = rows.filter((g) => g.team1_slug === opponent || g.team2_slug === opponent);
    return rows;
  }, [info, since, boType, opponent]);

  const maps = useMemo(() => {
    let rows = (info?.maps ?? [])
      .filter((m) => m.start_timestamp >= since)
      .sort((a, b) => b.start_timestamp - a.start_timestamp);
    if (mapFilter) rows = rows.filter((m) => m.map_name === mapFilter);
    if (mapOpponent)
      rows = rows.filter(
        (m) => m.team1_slug === mapOpponent || m.team2_slug === mapOpponent
      );
    return rows;
  }, [info, since, mapFilter, mapOpponent]);

  const leagues = useMemo(
    () =>
      (info?.leagues ?? [])
        .filter((l) => l.start_timestamp >= since)
        .sort((a, b) => b.start_timestamp - a.start_timestamp),
    [info, since]
  );

  const players = useMemo(
    () =>
      (info?.players ?? [])
        .map((p) => p[period])
        .filter((p): p is PlayerStats => Boolean(p)),
    [info, period]
  );
  const playerRows = useMemo(() => sortPlayers(players, sort, desc), [players, sort, desc]);

  const opponents = useMemo(() => {
    const found = new Map<string, string>();
    (info?.games ?? []).forEach((g) => {
      const other = g.team1_slug !== slug ? g.team1_slug : g.team2_slug;
      const name = g.team1_slug !== slug ? g.team1_name : g.team2_name;
      if (other && name) found.set(other, name);
    });
    return [...found]
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [info, slug]);

  const mapOptions = useMemo(() => {
    const names = [...new Set((info?.maps ?? []).map((m) => m.map_name))];
    return names
      .map((value) => ({ value, label: mapName(value) }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [info]);

  const titles = useMemo(
    () =>
      leagues.filter((l) =>
        l.tournament_prizes?.some((p) => p.place === "1st" && p.teams?.slug === slug)
      ),
    [leagues, slug]
  );

  const gamesPage = usePagination(games, 10);
  const mapsPage = usePagination(maps, 10);
  const leaguesPage = usePagination(leagues, 10);

  const active =
    tab === "games" ? gamesPage : tab === "maps" ? mapsPage : tab === "leagues" ? leaguesPage : null;

  const selectStat = (key: ColumnKey) => {
    if (key === sort) return setDesc(!desc);
    setSort(key);
    setDesc(true);
  };

  const selectGroup = (g: (typeof STAT_GROUPS)[number]) => {
    setGroup(g);
    setSort(g.stats[0]);
    setDesc(true);
  };

  if (loading) {
    return (
      <Screen back>
        <Seo {...teamSeo(slug)} />
        <Panel className="items-center justify-center p-8">
          <Text className="text-sm text-ink-3">Carregando…</Text>
        </Panel>
      </Screen>
    );
  }

  if (!info || notFound) {
    return (
      <Screen back>
        <Seo {...teamSeo(slug)} />
        <Panel className="items-center justify-center p-8">
          <Text className="text-sm text-ink-2">Time não encontrado</Text>
        </Panel>
      </Screen>
    );
  }

  const { team } = info;
  const gamesRecord = record(
    games.length,
    games.filter((g) => g.winner_team_slug === slug).length
  );
  const mapsRecord = record(
    maps.length,
    maps.filter((m) => m.winner_team === slug).length
  );

  return (
    <Screen back onEndReached={active?.hasMore ? active.showMore : undefined}>
      <Seo {...teamSeo(slug)} />

      <Panel className="relative gap-3 overflow-hidden p-4">
        <PrimaryGlow />

        <View className="flex-row items-center gap-3">
          <TeamImage imgUrl={team.img_url} size={52} />

          <View className="min-w-0 flex-1">
            <Text numberOfLines={1} className="text-lg font-extrabold text-ink">
              {team.team_name}
            </Text>
            <Text numberOfLines={1} className="mt-0.5 text-[11px] text-ink-2">
              {[team.country_name, team.region_code].filter(Boolean).join(" · ")}
            </Text>
          </View>

          {team.rank ? (
            <View className="flex-none items-end rounded-lg bg-surface-2 px-2.5 py-1.5">
              <Text className="text-[10px] font-semibold text-ink-3">valve rank</Text>
              <View className="flex-row items-baseline gap-1.5">
                <Text className="font-display text-sm font-bold text-ink">
                  {team.rank}º
                </Text>
                {team.points ? (
                  <Text className="text-[10px] text-ink-2">{team.points}pts</Text>
                ) : null}
              </View>
            </View>
          ) : null}
        </View>

        <View className="flex-row flex-wrap items-center gap-1.5">
          {titles.length ? (
            <Chip
              label={`${titles.length} ${titles.length > 1 ? "títulos" : "título"}`}
              tone="primary"
              icon={<Ionicons name="trophy" size={11} color="#e0a000" />}
            />
          ) : null}
          <Chip label={`${games.length} jogos`} />
          <Chip label={`${maps.length} mapas`} />
        </View>
      </Panel>

      <View className="flex-row items-center gap-2">
        <View className="min-w-[160px] flex-1">
          <Select
            title="Selecione um período"
            options={PERIOD_OPTIONS.map((p) => ({
              label: p.label,
              value: p.value as Period,
            }))}
            value={period}
            onChange={(v) => setPeriod(v ?? "6_months")}
          />
        </View>
      </View>

      <PillTabs
        value={tab}
        onChange={setTab}
        options={TABS.map((t) => ({ label: t.label, value: t.value }))}
      />

      {tab === "games" ? (
        <>
          <RecordStrip label="Jogos" {...gamesRecord} />
          <FormDots results={games.map((g) => g.winner_team_slug === slug)} />

          <View className="flex-row gap-2">
            <View className="min-w-0 flex-1">
              <Select
                title="Formato"
                emptyLabel="Todos os formatos"
                options={BO_OPTIONS}
                value={boType}
                onChange={setBoType}
              />
            </View>
            <View className="min-w-0 flex-1">
              <Select
                title="Adversário"
                emptyLabel="Todos os adversários"
                options={opponents}
                value={opponent}
                onChange={setOpponent}
              />
            </View>
          </View>

          <Panel className="overflow-hidden">
            <GameList games={gamesPage.visible} />
          </Panel>
        </>
      ) : null}

      {tab === "maps" ? (
        <>
          <RecordStrip label="Mapas" {...mapsRecord} />
          <FormDots results={maps.map((m) => m.winner_team === slug)} />

          <View className="flex-row gap-2">
            <View className="min-w-0 flex-1">
              <Select
                title="Mapa"
                emptyLabel="Todos os mapas"
                options={mapOptions}
                value={mapFilter}
                onChange={setMapFilter}
              />
            </View>
            <View className="min-w-0 flex-1">
              <Select
                title="Adversário"
                emptyLabel="Todos os adversários"
                options={opponents}
                value={mapOpponent}
                onChange={setMapOpponent}
              />
            </View>
          </View>

          <Panel className="overflow-hidden">
            <MapList maps={mapsPage.visible} />
          </Panel>
        </>
      ) : null}

      {tab === "leagues" ? (
        <>
          {titles.length ? (
            <View className="gap-2">
              <Eyebrow>Títulos no período</Eyebrow>
              <View className="flex-row flex-wrap gap-1.5">
                {titles.map((l) => (
                  <Chip
                    key={l.slug}
                    label={l.name}
                    tone="primary"
                    icon={<Ionicons name="trophy" size={11} color="#e0a000" />}
                  />
                ))}
              </View>
            </View>
          ) : null}

          <Panel className="overflow-hidden">
            <LeagueList leagues={leaguesPage.visible} />
          </Panel>
        </>
      ) : null}

      {tab === "players" ? (
        <>
          <StatGroupTabs value={group.title} onChange={selectGroup} />
          <StatsLegend columns={group.stats} sort={sort} />
          <PlayerStatsTable
            rows={playerRows}
            columns={group.stats}
            sort={sort}
            desc={desc}
            onSort={selectStat}
          />
        </>
      ) : null}

      {active?.hasMore ? (
        <Pressable onPress={active.showMore} className="items-center py-2">
          <Text className="text-xs font-bold text-ink-3">
            Carregando mais… ({active.visible.length})
          </Text>
        </Pressable>
      ) : null}
    </Screen>
  );
}
