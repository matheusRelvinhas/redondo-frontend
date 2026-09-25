import { View, Text, Pressable } from "react-native";
import { Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { TeamImage } from "./entity-image";
import { Chip } from "./ui";
import { useAppContext } from "@/context/context";
import { colorsFor } from "@/lib/colors";
import type { TeamStats } from "@/lib/teams";

export function TeamCard({
  team,
  first,
  regionRank,
}: {
  team: TeamStats;
  first?: boolean;
  regionRank?: number | null;
}) {
  return (
    <Link href={{ pathname: "/team/[slug]", params: { slug: team.slug } }} asChild>
      <Pressable
        className={`flex-row items-center gap-3 px-3.5 py-2.5 transition-colors duration-300 hover:bg-primary/10 active:bg-primary/10 ${
          first ? "" : "border-t border-line"
        }`}
      >
        <Text className="w-7 font-display text-sm font-bold text-ink-3">
          {team.rank ?? "–"}
        </Text>

        <TeamImage imgUrl={team.img_url} size={28} />

        <View className="min-w-0 flex-1">
          <Text numberOfLines={1} className="font-bold text-ink">
            {team.team_name}
          </Text>
          <Text numberOfLines={1} className="text-[11px] text-ink-2">
            {[team.country_name, team.region_code].filter(Boolean).join(" · ")}
          </Text>
        </View>

        {regionRank ? (
          <Chip label={`${team.region_code} #${regionRank}`} tone="outline" />
        ) : null}

        <View className="flex-none items-end">
          <Text className="font-display text-sm font-bold text-ink">
            {team.points ?? "–"}
          </Text>
          <Text className="text-[10px] text-ink-3">pts</Text>
        </View>
      </Pressable>
    </Link>
  );
}

export function TeamList({
  teams,
  loading,
  error,
  ranks,
}: {
  teams: TeamStats[];
  loading?: boolean;
  error?: boolean;
  ranks?: Map<string, number>;
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
        <Text className="text-sm text-ink-2">Não foi possível carregar os times</Text>
      </View>
    );
  }

  if (!teams.length) {
    return (
      <View className="items-center justify-center gap-2 py-8">
        <Ionicons name="alert-circle-outline" size={22} color={muted} />
        <Text className="text-sm text-ink-2">Nenhum time encontrado</Text>
      </View>
    );
  }

  return (
    <View>
      {teams.map((t, i) => (
        <TeamCard
          key={`${t.slug}-${t.id}`}
          team={t}
          first={i === 0}
          regionRank={ranks?.get(t.slug) ?? null}
        />
      ))}
    </View>
  );
}
