import { View, Text, Pressable } from "react-native";
import { Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LeagueImage } from "./entity-image";
import { Chip } from "./ui";
import { useAppContext } from "@/context/context";
import { colorsFor } from "@/lib/colors";
import { formatFullDate } from "@/lib/format";
import type { LeagueStats } from "@/lib/types";

function formatPrize(prize: number) {
  if (prize >= 1_000_000) return `US$ ${(prize / 1_000_000).toFixed(prize % 1_000_000 ? 1 : 0)}M`;
  if (prize >= 1_000) return `US$ ${Math.round(prize / 1_000)}K`;
  return `US$ ${prize}`;
}

export function LeagueCard({ league, first }: { league: LeagueStats; first?: boolean }) {
  const teams = league.teams?.length ?? 0;
  const champion = league.tournament_prizes?.find((p) => p.place === "1st")?.teams;

  return (
    <Link href={{ pathname: "/league/[slug]", params: { slug: league.slug } }} asChild>
      <Pressable
        className={`flex-row items-center gap-3 px-3.5 py-3 transition-colors duration-300 hover:bg-primary/10 active:bg-primary/10 ${
          first ? "" : "border-t border-line"
        }`}
      >
        <LeagueImage imgUrl={league.img_url} size={34} />

        <View className="min-w-0 flex-1 gap-1">
          <Text numberOfLines={1} className="font-bold text-ink">
            {league.name}
          </Text>

          <View className="flex-row flex-wrap items-center gap-x-2 gap-y-1">
            <Text className="text-[11px] font-semibold text-ink-2">
              {league.start_timestamp ? formatFullDate(league.start_timestamp) : "—"}
            </Text>
            {teams ? (
              <Text className="text-[11px] text-ink-3">{`${teams} times`}</Text>
            ) : null}
            {champion?.name ? (
              <View className="flex-row items-center gap-1">
                <Ionicons name="trophy" size={10} color="#e0a000" />
                <Text numberOfLines={1} className="text-[11px] font-semibold text-ink-2">
                  {champion.name}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        <View className="flex-none items-end gap-1">
          {league.tier ? (
            <Chip label={`Tier ${league.tier.toUpperCase()}`} tone="primary" />
          ) : null}
          {league.prize ? (
            <Text className="text-[11px] font-bold text-success">
              {formatPrize(league.prize)}
            </Text>
          ) : null}
        </View>
      </Pressable>
    </Link>
  );
}

export function LeagueList({
  leagues,
  loading,
  error,
}: {
  leagues: LeagueStats[];
  loading?: boolean;
  error?: boolean;
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
        <Text className="text-sm text-ink-2">Não foi possível carregar os campeonatos</Text>
      </View>
    );
  }

  if (!leagues.length) {
    return (
      <View className="items-center justify-center gap-2 py-8">
        <Ionicons name="alert-circle-outline" size={22} color={muted} />
        <Text className="text-sm text-ink-2">Nenhum campeonato encontrado</Text>
      </View>
    );
  }

  return (
    <View>
      {leagues.map((l, i) => (
        <LeagueCard key={`${l.slug}-${l.id}`} league={l} first={i === 0} />
      ))}
    </View>
  );
}
