import { View, Text, Pressable, Image } from "react-native";
import { Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import type { GameStats } from "@/lib/types";
import { formatDate, formatHour, isLiveGame, mapName } from "@/lib/format";
import { Chip, Score } from "./ui";
import { TeamImage, LeagueImage, mapImage } from "./entity-image";
import { LiveDot } from "./live-dot";
import { AiChip } from "./ai-chip";
import { useAppContext } from "@/context/context";
import { colorsFor } from "@/lib/colors";

function TeamRow({
  name,
  imgUrl,
  score,
  won,
  dimmed,
  pending,
}: {
  name: string | null;
  imgUrl: string | null;
  score: number | null;
  won: boolean;
  dimmed: boolean;
  pending: boolean;
}) {
  return (
    <View className="flex-row items-center gap-2">
      <TeamImage imgUrl={imgUrl} size={22} />
      <Text
        numberOfLines={1}
        className={`min-w-0 flex-1 font-bold ${dimmed ? "text-ink-2" : "text-ink"}`}
      >
        {name ?? "unknown team"}
      </Text>
      {pending ? null : <Score value={score ?? 0} won={won} />}
    </View>
  );
}

export function GameCard({
  game,
  first,
  live: forceLive,
}: {
  game: GameStats;
  first?: boolean;
  live?: boolean;
}) {
  const finished = game.status === "finished";
  const live = forceLive || isLiveGame(game);
  const upcoming = !live && game.status === "upcoming";
  const team1Won = game.winner_team_slug === game.team1_slug;
  const team2Won = game.winner_team_slug === game.team2_slug;
  const maps = [...(game.games_score ?? [])].sort((a, b) => a.order - b.order);

  return (
    <Link href={`/game/${game.slug}`} asChild>
      <Pressable
        className={`gap-1.5 px-3.5 py-3 active:bg-primary/10 ${first ? "" : "border-t border-line"}`}
      >
        <View className="flex-row items-center gap-1.5">
          <LeagueImage imgUrl={game.league_img_url} size={14} />
          <Text numberOfLines={1} className="min-w-0 flex-1 text-[11px] font-semibold text-ink-2">
            {game.league_name}
            {game.stage_round?.round ? ` · ${game.stage_round.round}` : ""}
          </Text>
          <Text className="flex-none text-[11px] font-bold text-ink-2">
            {formatDate(game.start_timestamp)} · {formatHour(game.start_timestamp)}
          </Text>
          {live ? (
            <View className="h-[22px] flex-row items-center gap-1.5 rounded-[7px] bg-danger/15 px-2">
              <LiveDot size={7} />
              <Text className="text-[11px] font-bold text-danger">Ao vivo</Text>
            </View>
          ) : null}
          {game.bo_type ? <Chip label={`Bo${game.bo_type}`} tone="primary" /> : null}
        </View>

        <View className="gap-1.5">
          <TeamRow
            name={game.team1_name}
            imgUrl={game.team1_img_url}
            score={game.team1_score}
            won={team1Won}
            dimmed={finished && !team1Won}
            pending={upcoming}
          />
          <TeamRow
            name={game.team2_name}
            imgUrl={game.team2_img_url}
            score={game.team2_score}
            won={team2Won}
            dimmed={finished && !team2Won}
            pending={upcoming}
          />
        </View>

        {maps.length > 0 || game.ai_predictions ? (
          <View className="mt-0.5 flex-row flex-wrap items-center gap-1.5">
            {maps.map((m, i) => {
              const t1 = m.winner_team === game.team1_slug;
              return (
                <View
                  key={`${m.map_name}-${i}`}
                  className="h-[22px] flex-row items-center gap-1.5 rounded-[7px] border border-line bg-surface-2 py-0 pl-1 pr-1.5"
                >
                  <Image
                    source={mapImage(m.map_name, "thumb")}
                    style={{ width: 14, height: 14, borderRadius: 4, opacity: 0.9 }}
                    resizeMode="cover"
                  />
                  <Text className="text-[11px] font-bold text-ink-2">{mapName(m.map_name)}</Text>
                  <Text className="text-[11px] font-bold text-ink">
                    {t1 ? m.winner_score : m.loser_score}–{t1 ? m.loser_score : m.winner_score}
                  </Text>
                </View>
              );
            })}
            <AiChip game={game} className="ml-auto" />
          </View>
        ) : null}
      </Pressable>
    </Link>
  );
}

export function GameList({
  games,
  loading,
  error,
  live,
}: {
  games: GameStats[];
  loading?: boolean;
  error?: boolean;
  live?: boolean;
}) {
  const { theme } = useAppContext();
  const muted = colorsFor(theme).ink3;

  if (loading) {
    return (
      <View className="items-center justify-center py-10">
        <Text className="text-sm text-ink-3">Carregando…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="items-center justify-center gap-2 py-8">
        <Ionicons name="cloud-offline-outline" size={22} color={muted} />
        <Text className="text-sm text-ink-2">Não foi possível carregar os jogos</Text>
      </View>
    );
  }

  if (!games.length) {
    return (
      <View className="items-center justify-center gap-2 py-8">
        <Ionicons name="alert-circle-outline" size={22} color={muted} />
        <Text className="text-sm text-ink-2">Nenhum jogo encontrado</Text>
      </View>
    );
  }

  return (
    <View>
      {games.map((g, i) => (
        <GameCard key={`${g.slug}-${g.id}`} game={g} first={i === 0} live={live} />
      ))}
    </View>
  );
}
