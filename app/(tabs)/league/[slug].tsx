import { useMemo, useState } from "react";
import { View, Text, Pressable } from "react-native";
import { Link, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "@/components/screen";
import { Seo } from "@/components/seo";
import { leagueSeo } from "@/lib/seo";
import { Panel, Chip, Eyebrow, Segmented } from "@/components/ui";
import { LeagueImage, TeamImage } from "@/components/entity-image";
import { GameList } from "@/components/game-card";
import { LiveDot } from "@/components/live-dot";
import { PrimaryGlow } from "@/components/primary-glow";
import { Select } from "@/components/select";
import { useAppContext } from "@/context/context";
import { formatFullDate } from "@/lib/format";
import { stageOptions, useLeague } from "@/lib/leagues";
import { usePagination } from "@/lib/games";
import type { GameStats, TournamentTeam } from "@/lib/types";

const placeNumber = (place?: string | null) => {
  if (!place) return 999;
  const n = parseInt(place, 10);
  return Number.isNaN(n) ? 999 : n;
};

function teamRecord(games: GameStats[], slug: string | null) {
  if (!slug) return null;
  const played = games.filter((g) => g.team1_slug === slug || g.team2_slug === slug);
  if (!played.length) return null;

  const wins = played.filter((g) => g.winner_team_slug === slug).length;
  return { wins, losses: played.length - wins };
}

function TeamRow({
  team,
  place,
  games,
}: {
  team: TournamentTeam;
  place?: string | null;
  games: GameStats[];
}) {
  const record = teamRecord(games, team.slug);

  const row = (
    <View className="flex-row items-center justify-between gap-2 rounded-lg bg-surface-2 px-2 py-1.5">
        <View className="min-w-0 flex-1 flex-row items-center gap-2">
          <TeamImage imgUrl={team.img_url} size={20} />
          <Text numberOfLines={1} className="min-w-0 flex-1 text-xs font-bold text-ink">
            {team.name}
          </Text>
        </View>

        <View className="flex-none flex-row items-center gap-2">
          {place ? (
            <View className="flex-row items-center gap-1">
              <Text className="text-[11px] font-semibold text-ink-2">{place}</Text>
              {place === "1st" ? (
                <Ionicons name="trophy" size={11} color="#e0a000" />
              ) : null}
            </View>
          ) : null}
          {record ? (
            <Text
              className={`text-[11px] font-bold ${
                record.wins > record.losses
                  ? "text-success"
                  : record.wins < record.losses
                    ? "text-danger"
                    : "text-ink-2"
              }`}
            >
              {record.wins} - {record.losses}
            </Text>
          ) : null}
        </View>
    </View>
  );

  if (!team.slug) return row;

  return (
    <Link href={{ pathname: "/team/[slug]", params: { slug: team.slug } }} asChild>
      <Pressable className="active:opacity-70">{row}</Pressable>
    </Link>
  );
}

export default function LeagueScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { isDesktop } = useAppContext();
  const { league, finished, upcoming, hasLive, loading, notFound } = useLeague(slug);

  const columns = isDesktop ? 2 : 1;

  const [status, setStatus] = useState<"finished" | "upcoming">("finished");
  const [stage, setStage] = useState<string | null>(null);

  const stages = useMemo(() => stageOptions(finished, upcoming), [finished, upcoming]);

  // campeonato encerrado não tem "próximos": some com o seletor e mostra
  // direto os jogos finalizados
  const leagueEnded = league?.status === "finished";
  const gamesStatus = leagueEnded ? "finished" : status;

  const games = useMemo(() => {
    const base = gamesStatus === "finished" ? finished : upcoming;
    return stage ? base.filter((g) => g.stage_round?.round === stage) : base;
  }, [gamesStatus, stage, finished, upcoming]);

  const { visible, hasMore, showMore } = usePagination(games, 10);

  if (loading) {
    return (
      <Screen back>
        <Seo {...leagueSeo(slug)} />
        <Panel className="items-center justify-center p-8">
          <Text className="text-sm text-ink-3">Carregando…</Text>
        </Panel>
      </Screen>
    );
  }

  if (!league || notFound) {
    return (
      <Screen back>
        <Seo {...leagueSeo(slug)} />
        <Panel className="items-center justify-center p-8">
          <Text className="text-sm text-ink-2">Campeonato não encontrado</Text>
        </Panel>
      </Screen>
    );
  }

  const standings = league.tournament_prizes?.length
    ? [...league.tournament_prizes].sort(
        (a, b) => placeNumber(a.place) - placeNumber(b.place)
      )
    : null;

  const entries: { team: TournamentTeam; place?: string | null }[] = standings
    ? standings.flatMap((p) => (p.teams ? [{ team: p.teams, place: p.place }] : []))
    : (league.teams ?? []).filter(Boolean).map((team) => ({ team }));

  const standingsRows = entries.reduce<(typeof entries)[]>((rows, entry, i) => {
    if (i % columns === 0) rows.push([]);
    rows[rows.length - 1].push(entry);
    return rows;
  }, []);

  return (
    <Screen back onEndReached={hasMore ? showMore : undefined}>
      <Seo {...leagueSeo(slug)} />

      <Panel className="relative gap-3 overflow-hidden p-4">
        <PrimaryGlow />

        <View className="flex-row items-start gap-3">
          <LeagueImage imgUrl={league.img_url} size={44} />
          <View className="min-w-0 flex-1">
            <Text numberOfLines={2} className="text-base font-extrabold text-ink">
              {league.name}
            </Text>
            {league.start_timestamp ? (
              <Text className="mt-0.5 text-[11px] text-ink-2">
                {formatFullDate(league.start_timestamp)}
              </Text>
            ) : null}
          </View>
          {leagueEnded ? <Chip label="Finalizado" /> : null}
        </View>

        <View className="flex-row flex-wrap items-center gap-1.5">
          {hasLive ? (
            <View className="h-[22px] flex-row items-center gap-1.5 rounded-[7px] bg-danger/15 px-2">
              <LiveDot size={7} />
              <Text className="text-[11px] font-bold text-danger">Ao vivo</Text>
            </View>
          ) : null}
          {league.tier ? (
            <Chip label={`Tier ${league.tier.toUpperCase()}`} tone="primary" />
          ) : null}
          {league.prize ? (
            <Chip label={`US$ ${league.prize.toLocaleString("pt-BR")}`} tone="success" />
          ) : null}
          {league.teams?.length ? <Chip label={`${league.teams.length} times`} /> : null}
        </View>
      </Panel>

      {standingsRows.length ? (
        <View className="gap-2">
          <Eyebrow>{standings?.length ? "Classificação" : "Times"}</Eyebrow>
          <Panel className="gap-1.5 p-2.5">
            {standingsRows.map((row, rowIndex) => (
              <View key={rowIndex} className="flex-row gap-1.5">
                {row.map((entry, i) => (
                  <View key={`${entry.team.slug ?? "team"}-${rowIndex}-${i}`} className="min-w-0 flex-1">
                    <TeamRow team={entry.team} place={entry.place} games={finished} />
                  </View>
                ))}
                {/* mantém o alinhamento quando a última linha tem só um time */}
                {columns > 1 && row.length < columns ? <View className="flex-1" /> : null}
              </View>
            ))}
          </Panel>
        </View>
      ) : null}

      <View className="flex-row flex-wrap items-center justify-between gap-2">
        {leagueEnded ? (
          <Eyebrow>Jogos</Eyebrow>
        ) : (
          <Segmented
            value={status}
            onChange={setStatus}
            options={[
              { label: "Finalizados", value: "finished" },
              { label: "Próximos", value: "upcoming" },
            ]}
          />
        )}
        {stages.length ? (
          <View className="min-w-[160px] flex-1">
            <Select
              title="Selecione uma fase"
              placeholder="Todas as fases"
              emptyLabel="Todas as fases"
              options={stages.map((s) => ({ label: s, value: s }))}
              value={stage}
              onChange={setStage}
            />
          </View>
        ) : null}
      </View>

      <Panel className="overflow-hidden">
        <GameList games={visible} />
      </Panel>

      {hasMore ? (
        <Pressable onPress={showMore} className="items-center py-2">
          <Text className="text-xs font-bold text-ink-3">
            Carregando mais… ({visible.length} de {games.length})
          </Text>
        </Pressable>
      ) : null}
    </Screen>
  );
}
