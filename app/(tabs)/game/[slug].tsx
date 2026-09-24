import { useState } from "react";
import { View, Text, ImageBackground, Pressable, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Screen } from "@/components/screen";
import { Panel, Chip, Eyebrow, PanelHeader, Segmented } from "@/components/ui";
import { TeamImage, LeagueImage, PlayerImage, mapImage } from "@/components/entity-image";
import { LiveDot } from "@/components/live-dot";
import { AiChip } from "@/components/ai-chip";
import { GameSide } from "@/components/game-side";
import { PrimaryGlow } from "@/components/primary-glow";
import { AiAnalysis } from "@/components/ai-analysis";
import { formatFullDate, formatHour, isLiveGame, mapName } from "@/lib/format";
import { useGame } from "@/lib/games";
import { useAiAnalysis } from "@/lib/ai-analysis";
import { useAppContext } from "@/context/context";
import type { GamePlayerStats, GameStats } from "@/lib/types";

const deathsOf = (p: GamePlayerStats) => p.death ?? p.deaths ?? 0;

const multikillsOf = (p: GamePlayerStats) =>
  p.multikills ? Object.values(p.multikills).reduce((sum, n) => sum + n, 0) : 0;

const RATING_API_MAX = 10;
const RATING_MAX = 5;

const toRating = (apiRating: number) => (apiRating * RATING_MAX) / RATING_API_MAX;

const RATING_GREEN = 3.5;
const RATING_FLOOR = 1.5;

function ratingColor(rating: number, dark: boolean) {
  const t = Math.max(0, Math.min(1, (rating - RATING_FLOOR) / (RATING_GREEN - RATING_FLOOR)));
  const hue = Math.round(t * 120); // 0 = vermelho, 120 = verde
  return `hsl(${hue}, ${dark ? 70 : 65}%, ${dark ? 58 : 42}%)`;
}

type ColumnKey = "kills" | "death" | "assists" | "adr" | "trades" | "multikills" | "clutches";

type Column = { key: ColumnKey; label: string; name: string; width: string };

const OVERALL_COLUMNS: Column[] = [
  { key: "kills", label: "K", name: "Kills", width: "w-10" },
  { key: "death", label: "D", name: "Mortes", width: "w-10" },
  { key: "assists", label: "A", name: "Assist.", width: "w-10" },
];

const PERFORMANCE_COLUMNS: Column[] = [
  { key: "adr", label: "ADR", name: "ADR", width: "w-12" },
  { key: "trades", label: "T", name: "Trades", width: "w-14" },
  { key: "multikills", label: "M", name: "Multikills", width: "w-10" },
  { key: "clutches", label: "C", name: "Clutches", width: "w-10" },
];

function StatsLegend({ columns }: { columns: Column[] }) {
  return (
    <View className="flex-row flex-wrap gap-x-3.5 gap-y-1 px-1">
      {columns.map((c) => (
        <View key={c.key} className="flex-row items-center gap-1">
          <Text className="text-[10px] font-extrabold uppercase text-ink-2">{c.label}</Text>
          <Text className="text-[10.5px] text-ink-3">{c.name}</Text>
        </View>
      ))}
      <View className="flex-row items-center gap-1">
        <Text className="text-[10px] font-extrabold uppercase text-ink-2">Rating</Text>
        <Text className="text-[10.5px] text-ink-3">{`desempenho geral (0–${RATING_MAX})`}</Text>
      </View>
    </View>
  );
}

function Scoreboard({
  players,
  teamSlug,
  teamName,
  imgUrl,
  winnerSlug,
  score,
  columns,
  dark,
}: {
  players: GamePlayerStats[];
  teamSlug: string | null;
  teamName: string | null;
  imgUrl: string | null;
  winnerSlug: string | null;
  score: [number, number] | null;
  columns: Column[];
  dark: boolean;
}) {
  const rows = players
    .filter((p) => p.team_slug === teamSlug)
    .sort((a, b) => b.player_rating - a.player_rating);

  if (!rows.length) return null;
  const won = winnerSlug === teamSlug;

  const cell = (p: GamePlayerStats, key: ColumnKey) => {
    switch (key) {
      case "kills":
        return <Text className="text-xs font-extrabold text-ink">{p.kills}</Text>;
      case "death":
        return <Text className="text-xs font-semibold text-ink-2">{deathsOf(p)}</Text>;
      case "assists":
        return <Text className="text-xs font-semibold text-ink-2">{p.assists}</Text>;
      case "adr":
        return <Text className="text-xs font-semibold text-ink-2">{Math.round(p.adr)}</Text>;
      case "trades": {
        const balance = (p.trade_kills ?? 0) - (p.trade_death ?? 0);
        return (
          <Text
            className={`text-xs font-semibold ${
              balance > 0 ? "text-success" : balance < 0 ? "text-danger" : "text-ink-2"
            }`}
          >
            {p.trade_kills ?? 0} / {p.trade_death ?? 0}
          </Text>
        );
      }
      case "multikills":
        return <Text className="text-xs font-semibold text-ink-2">{multikillsOf(p)}</Text>;
      case "clutches":
        return <Text className="text-xs font-semibold text-ink-2">{p.clutches ?? 0}</Text>;
    }
  };

  return (
    <Panel className="overflow-hidden">
      <PanelHeader
        title={
          <View className="flex-row items-center gap-2">
            <TeamImage imgUrl={imgUrl} size={24} />
            <Text className="text-[13.5px] font-extrabold text-ink">{teamName}</Text>
          </View>
        }
        right={
          <Text className={`text-[11px] font-bold ${won ? "text-success" : "text-ink-2"}`}>
            {won ? "Venceu" : "Perdeu"}
            {score ? ` · ${score[0]}–${score[1]}` : ""}
          </Text>
        }
      />
      <View className="mt-2 flex-row border-y border-line bg-surface-2 px-3.5 py-1.5">
        <Text className="min-w-0 flex-1 text-[10px] font-extrabold uppercase tracking-wider text-ink-3">
          Jogador
        </Text>
        {columns.map((c) => (
          <Text
            key={c.key}
            numberOfLines={1}
            className={`${c.width} text-center text-[10px] font-extrabold uppercase tracking-wider text-ink-3`}
          >
            {c.label}
          </Text>
        ))}
        <Text className="w-16 pl-3 text-center text-[10px] font-extrabold uppercase tracking-wider text-ink-3">
          Rating
        </Text>
      </View>
      {rows.map((p, i) => (
        <View
          key={p.slug ?? p.name}
          className={`flex-row items-center px-3.5 py-1.5 ${i ? "border-t border-line" : ""}`}
        >
          <View className="min-w-0 flex-1 flex-row items-center gap-2">
            <PlayerImage imgUrl={`${p.slug}.webp`} size={30} />
            <View className="min-w-0 flex-1 flex-row items-center gap-1.5">
              <Text numberOfLines={1} className="font-bold text-ink">
                {p.name}
              </Text>
              <Text className="text-[8.5px] font-extrabold text-ink-3">{p.country_code}</Text>
            </View>
          </View>
          {columns.map((c) => (
            <View key={c.key} className={`${c.width} items-center`}>
              {cell(p, c.key)}
            </View>
          ))}

          <View className="w-16 items-center gap-1 pl-3">
            <Text className="font-display text-xs font-bold text-ink">
              {toRating(p.player_rating).toFixed(2)}
            </Text>
            <View className="h-1 w-full overflow-hidden rounded-sm bg-surface-3">
              <View
                className="h-full rounded-sm"
                style={{
                  width: `${Math.min(100, (toRating(p.player_rating) / RATING_MAX) * 100)}%`,
                  backgroundColor: ratingColor(toRating(p.player_rating), dark),
                }}
              />
            </View>
          </View>
        </View>
      ))}
    </Panel>
  );
}

function MapTile({
  label,
  sub,
  left,
  right,
  selected,
  mapSlug,
  onPress,
}: {
  label: string;
  sub?: string;
  left: number | string;
  right: number | string;
  selected: boolean;
  mapSlug?: string;
  onPress: () => void;
}) {
  // quem fez mais pontos fica em destaque, como no placar da partida
  const leftWon = typeof left === "number" && typeof right === "number" && left > right;
  const rightWon = typeof left === "number" && typeof right === "number" && right > left;

  const content = (
    <View className="h-full w-full justify-between p-2">
      <View className="flex-row items-center gap-1">
        {selected ? <View className="h-1.5 w-1.5 rounded-full bg-primary" /> : null}
        <Text className="text-[11px] font-extrabold uppercase tracking-wider text-ink">
          {label}
        </Text>
        {sub ? <Text className="text-[9.5px] text-ink-2">{sub}</Text> : null}
      </View>
      <Text className="font-display text-lg font-bold">
        <Text className={leftWon ? "text-ink" : "text-ink-2"}>{left}</Text>
        <Text className="text-ink-3">{" : "}</Text>
        <Text className={rightWon ? "text-ink" : "text-ink-2"}>{right}</Text>
      </Text>
    </View>
  );

  return (
    <Pressable
      onPress={onPress}
      className={`h-[74px] w-[118px] overflow-hidden rounded-xl border ${
        selected ? "border-primary" : "border-line"
      }`}
    >
      {mapSlug ? (
        <ImageBackground
          source={mapImage(mapSlug)}
          resizeMode="cover"
          imageStyle={{ opacity: 0.4 }}
          className="h-full w-full"
        >
          <PrimaryGlow opacity={selected ? 0.22 : 0.1} />
          {content}
        </ImageBackground>
      ) : (
        <View className="h-full w-full bg-surface-2">
          <PrimaryGlow opacity={selected ? 0.22 : 0.1} />
          {content}
        </View>
      )}
    </Pressable>
  );
}

export default function GameScreen() {
  const router = useRouter();
  const { theme, isDesktop } = useAppContext();
  const { slug, map } = useLocalSearchParams<{ slug: string; map?: string }>();

  const [statsTab, setStatsTab] = useState<"overall" | "performance">("overall");
  const columns = isDesktop
    ? [...OVERALL_COLUMNS, ...PERFORMANCE_COLUMNS]
    : statsTab === "overall"
      ? OVERALL_COLUMNS
      : PERFORMANCE_COLUMNS;

  const selectedMap = map ?? null;
  const selectMap = (value: string | null) =>
    router.setParams({ map: value ?? undefined });

  const { game, players, sides, loading, notFound } = useGame(slug, selectedMap);
  const ai = useAiAnalysis(slug, game?.status);

  if (loading) {
    return (
      <Screen back>
        <Panel className="items-center justify-center p-8">
          <Text className="text-sm text-ink-3">Carregando…</Text>
        </Panel>
      </Screen>
    );
  }

  if (!game || notFound) {
    return (
      <Screen back>
        <Panel className="items-center justify-center p-8">
          <Text className="text-sm text-ink-2">Partida não encontrada</Text>
        </Panel>
      </Screen>
    );
  }

  const finished = game.status === "finished";
  const live = isLiveGame(game);
  const team1Won = game.winner_team_slug === game.team1_slug;
  const team2Won = game.winner_team_slug === game.team2_slug;
  const maps = [...(game.games_score ?? [])].sort((a, b) => a.order - b.order);

  const currentMap = selectedMap
    ? (maps.find((m) => m.map_name === selectedMap) ?? null)
    : null;

  const winnerSlug = selectedMap
    ? (currentMap?.winner_team ?? null)
    : game.winner_team_slug;

  const scoreFor = (teamSlug: string | null): [number, number] | null => {
    if (currentMap) {
      const isWinner = currentMap.winner_team === teamSlug;
      return isWinner
        ? [currentMap.winner_score, currentMap.loser_score]
        : [currentMap.loser_score, currentMap.winner_score];
    }
    if (selectedMap) return null; // mapa selecionado mas sem placar na resposta
    const { team1_score: s1, team2_score: s2 } = game;
    if (s1 == null || s2 == null) return null;
    return teamSlug === game.team1_slug ? [s1, s2] : [s2, s1];
  };

  return (
    <Screen back>
      <Panel className="relative gap-3.5 overflow-hidden p-4">
        <PrimaryGlow />
        <View className="flex-row items-center justify-between gap-2">
          <View className="min-w-0 flex-1 flex-row items-center gap-2">
            <LeagueImage imgUrl={game.league_img_url} size={22} />
            <View className="min-w-0 flex-1">
              <Text numberOfLines={1} className="text-[12.5px] font-bold text-ink">
                {game.league_name}
              </Text>
              {game.stage_round?.round ? (
                <Text numberOfLines={1} className="text-[11px] text-ink-2">
                  {game.stage_round.round}
                </Text>
              ) : null}
            </View>
          </View>
          {live ? (
            <View className="h-[22px] flex-row items-center gap-1.5 rounded-[7px] bg-danger/15 px-2">
              <LiveDot size={7} />
              <Text className="text-[11px] font-bold text-danger">Ao vivo</Text>
            </View>
          ) : (
            <Chip label={finished ? "Finalizado" : "Agendado"} />
          )}
        </View>

        <View className="flex-row items-center justify-center gap-3">
          <View className="min-w-0 flex-1 items-center gap-2">
            <TeamImage imgUrl={game.team1_img_url} size={52} />
            <Text
              numberOfLines={1}
              className={`text-sm font-extrabold ${team1Won || !finished ? "text-ink" : "text-ink-2"}`}
            >
              {game.team1_name}
            </Text>
          </View>

          <View className="flex-row items-center gap-2.5">
            <Text className={`font-display text-[40px] font-bold ${team1Won ? "text-ink" : "text-ink-2"}`}>
              {game.team1_score ?? "–"}
            </Text>
            <Text className="font-display text-2xl text-ink-3">:</Text>
            <Text className={`font-display text-[40px] font-bold ${team2Won ? "text-ink" : "text-ink-2"}`}>
              {game.team2_score ?? "–"}
            </Text>
          </View>

          <View className="min-w-0 flex-1 items-center gap-2">
            <TeamImage imgUrl={game.team2_img_url} size={52} />
            <Text
              numberOfLines={1}
              className={`text-sm font-extrabold ${team2Won || !finished ? "text-ink" : "text-ink-2"}`}
            >
              {game.team2_name}
            </Text>
          </View>
        </View>

        <View className="flex-row flex-wrap justify-center gap-1.5">
          {game.bo_type ? <Chip label={`Bo${game.bo_type}`} tone="primary" /> : null}
          <Chip label={formatFullDate(game.start_timestamp)} />
          <Chip label={formatHour(game.start_timestamp)} />
          <AiChip game={game} />
        </View>
      </Panel>

      {maps.length > 0 ? (
        <View className="gap-2">
          <Eyebrow>Mapas</Eyebrow>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-2">
              <MapTile
                label="Série"
                sub={game.bo_type ? `Bo${game.bo_type}` : undefined}
                left={game.team1_score ?? "–"}
                right={game.team2_score ?? "–"}
                selected={!selectedMap}
                onPress={() => selectMap(null)}
              />
              {maps.map((m, i) => {
                const t1 = m.winner_team === game.team1_slug;
                return (
                  <MapTile
                    key={`${m.map_name}-${i}`}
                    label={mapName(m.map_name)}
                    sub={`Mapa ${m.order}`}
                    left={t1 ? m.winner_score : m.loser_score}
                    right={t1 ? m.loser_score : m.winner_score}
                    selected={selectedMap === m.map_name}
                    mapSlug={m.map_name}
                    onPress={() => selectMap(m.map_name)}
                  />
                );
              })}
            </View>
          </ScrollView>
        </View>
      ) : null}

      {finished && selectedMap && sides.length ? (
        <GameSide gamesSide={sides} filterMap={selectedMap} game={game} />
      ) : null}

      {finished ? (
        players.length ? (
          <View className="gap-3.5">
            <View className="flex-row items-center justify-between gap-2">
              <Eyebrow>Estatísticas</Eyebrow>
              <Chip
                label={selectedMap ? mapName(selectedMap) : "Todos os mapas"}
                tone="outline"
              />
            </View>

            {isDesktop ? null : (
              <Segmented
                value={statsTab}
                onChange={setStatsTab}
                options={[
                  { label: "Geral", value: "overall" },
                  { label: "Desempenho", value: "performance" },
                ]}
              />
            )}
            <Scoreboard
              players={players}
              teamSlug={game.team1_slug}
              teamName={game.team1_name}
              imgUrl={game.team1_img_url}
              winnerSlug={winnerSlug}
              score={scoreFor(game.team1_slug)}
              columns={columns}
              dark={theme === "dark"}
            />
            <Scoreboard
              players={players}
              teamSlug={game.team2_slug}
              teamName={game.team2_name}
              imgUrl={game.team2_img_url}
              winnerSlug={winnerSlug}
              score={scoreFor(game.team2_slug)}
              columns={columns}
              dark={theme === "dark"}
            />
            <StatsLegend columns={columns} />
          </View>
        ) : (
          <Panel className="items-center justify-center p-6">
            <Text className="text-sm text-ink-2">
              {selectedMap
                ? "Sem estatísticas para este mapa"
                : "Aguarde, nenhum resultado disponível"}
            </Text>
          </Panel>
        )
      ) : null}

      <AiAnalysis
        analysis={ai.analysis}
        timestamp={ai.timestamp}
        loading={ai.loading}
        onGenerate={ai.generate}
        canGenerate={!finished}
      />
    </Screen>
  );
}
