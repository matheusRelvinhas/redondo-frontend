import { useMemo, useState } from "react";
import { View, Text, Pressable } from "react-native";
import { Link, useLocalSearchParams } from "expo-router";
import { Screen } from "@/components/screen";
import { Seo } from "@/components/seo";
import { playerSeo } from "@/lib/seo";
import { Panel, Chip, Eyebrow } from "@/components/ui";
import {
  PlayerStatsTable,
  StatGroupTabs,
  StatsLegend,
} from "@/components/player-stats-table";
import { PlayerImage, TeamImage } from "@/components/entity-image";
import { PrimaryGlow } from "@/components/primary-glow";
import {
  STAT_GROUPS,
  sortPlayers,
  usePlayer,
  type ColumnKey,
} from "@/lib/players";

export default function PlayerScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { player, loading, notFound } = usePlayer(slug);

  const [group, setGroup] = useState(STAT_GROUPS[0]);
  const [sort, setSort] = useState<ColumnKey>("period");
  const [desc, setDesc] = useState(false);

  const rows = useMemo(
    () => sortPlayers(player?.stats ?? [], sort, desc),
    [player, sort, desc]
  );

  const selectStat = (key: ColumnKey) => {
    if (key === sort) return setDesc(!desc);
    setSort(key);
    setDesc(key !== "period");
  };

  const selectGroup = (g: (typeof STAT_GROUPS)[number]) => {
    setGroup(g);
    setSort(g.stats[0]);
    setDesc(true);
  };

  if (loading) {
    return (
      <Screen back>
        <Seo {...playerSeo(slug)} />
        <Panel className="items-center justify-center p-8">
          <Text className="text-sm text-ink-3">Carregando…</Text>
        </Panel>
      </Screen>
    );
  }

  if (!player || notFound) {
    return (
      <Screen back>
        <Seo {...playerSeo(slug)} />
        <Panel className="items-center justify-center p-8">
          <Text className="text-sm text-ink-2">Jogador não encontrado</Text>
        </Panel>
      </Screen>
    );
  }

  const fullName = `${player.first_name ?? ""} ${player.last_name ?? ""}`.trim();
  const mapsPlayed = player.stats.find((s) => String(s.period) === "12")?.games_count ?? null;

  return (
    <Screen back>
      <Seo {...playerSeo(slug)} />

      <Panel className="relative gap-3 overflow-hidden p-4">
        <PrimaryGlow />

        <View className="flex-row items-center gap-3">
          <PlayerImage imgUrl={player.img_url} size={56} />

          <View className="min-w-0 flex-1">
            <View className="flex-row items-center gap-2">
              <Text numberOfLines={1} className="text-lg font-extrabold text-ink">
                {player.nickname}
              </Text>
              {player.country_code ? (
                <Text className="text-[10px] font-extrabold text-ink-3">
                  {player.country_code.toUpperCase()}
                </Text>
              ) : null}
            </View>
            {fullName ? (
              <Text numberOfLines={1} className="mt-0.5 text-[11px] text-ink-2">
                {fullName}
              </Text>
            ) : null}
          </View>

          {player.team_name && player.team_slug ? (
            <Link
              href={{ pathname: "/team/[slug]", params: { slug: player.team_slug } }}
              asChild
            >
              <Pressable className="flex-none flex-row items-center gap-2 rounded-lg bg-surface-2 px-2 py-1.5 active:opacity-70">
                <TeamImage imgUrl={player.team_img_url} size={22} />
                <View>
                  <Text numberOfLines={1} className="text-[11px] font-bold text-ink">
                    {player.team_name}
                  </Text>
                  {player.team_rank ? (
                    <Text className="text-[10px] text-ink-2">
                      {`valve ${player.team_rank}º`}
                      {player.team_points ? ` · ${player.team_points}pts` : ""}
                    </Text>
                  ) : null}
                </View>
              </Pressable>
            </Link>
          ) : null}
        </View>

        <View className="flex-row flex-wrap gap-1.5">
          <Chip label={`${player.stats.length} períodos`} tone="primary" />
          {mapsPlayed ? <Chip label={`${mapsPlayed} mapas em 12 meses`} /> : null}
        </View>
      </Panel>

      <View className="gap-2">
        <Eyebrow>Estatísticas por período</Eyebrow>
        <StatGroupTabs value={group.title} onChange={selectGroup} />
      </View>

      <StatsLegend columns={group.stats} sort={sort} />

      <PlayerStatsTable
        rows={rows}
        columns={["period", ...group.stats]}
        sort={sort}
        desc={desc}
        onSort={selectStat}
        showPlayer={false}
      />
    </Screen>
  );
}
