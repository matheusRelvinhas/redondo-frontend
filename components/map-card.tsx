import { View, Text, Pressable, Image } from "react-native";
import { Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { TeamImage, mapImage } from "./entity-image";
import { Chip, Score } from "./ui";
import { useAppContext } from "@/context/context";
import { colorsFor } from "@/lib/colors";
import { formatDate, mapName } from "@/lib/format";
import type { TeamMap } from "@/lib/teams";

function TeamRow({
  name,
  imgUrl,
  score,
  won,
}: {
  name: string | null;
  imgUrl: string | null;
  score: number;
  won: boolean;
}) {
  return (
    <View className="flex-row items-center gap-2">
      <TeamImage imgUrl={imgUrl} size={22} />
      <Text
        numberOfLines={1}
        className={`min-w-0 flex-1 font-bold ${won ? "text-ink" : "text-ink-2"}`}
      >
        {name ?? "unknown team"}
      </Text>
      <Score value={score} won={won} />
    </View>
  );
}

export function MapCard({ map, first }: { map: TeamMap; first?: boolean }) {
  const team1Won = map.winner_team === map.team1_slug;

  return (
    <Link
      href={{
        pathname: "/game/[slug]",
        params: { slug: map.game_slug, map: map.map_name },
      }}
      asChild
    >
      <Pressable
        className={`gap-1.5 px-3.5 py-3 transition-colors duration-300 hover:bg-primary/10 active:bg-primary/10 ${
          first ? "" : "border-t border-line"
        }`}
      >
        <View className="flex-row items-center gap-1.5">
          <Image
            source={mapImage(map.map_name, "thumb")}
            style={{ width: 14, height: 14, borderRadius: 4, opacity: 0.9 }}
            resizeMode="cover"
          />
          <Text numberOfLines={1} className="min-w-0 flex-1 text-[11px] font-semibold text-ink-2">
            {mapName(map.map_name)}
            {map.order ? ` · Mapa ${map.order}` : ""}
          </Text>
          <Text className="flex-none text-[11px] font-bold text-ink-2">
            {formatDate(map.start_timestamp)}
          </Text>
          {map.rounds_count ? <Chip label={`${map.rounds_count} rounds`} /> : null}
        </View>

        <View className="gap-1.5">
          <TeamRow
            name={map.team1_name}
            imgUrl={map.team1_img_url}
            score={team1Won ? map.winner_score : map.loser_score}
            won={team1Won}
          />
          <TeamRow
            name={map.team2_name}
            imgUrl={map.team2_img_url}
            score={team1Won ? map.loser_score : map.winner_score}
            won={!team1Won}
          />
        </View>
      </Pressable>
    </Link>
  );
}

export function MapList({ maps, loading }: { maps: TeamMap[]; loading?: boolean }) {
  const { theme } = useAppContext();
  const muted = colorsFor(theme).ink3;

  if (loading) {
    return (
      <View className="items-center justify-center py-10">
        <Text className="text-sm text-ink-3">Carregando…</Text>
      </View>
    );
  }

  if (!maps.length) {
    return (
      <View className="items-center justify-center gap-2 py-8">
        <Ionicons name="alert-circle-outline" size={22} color={muted} />
        <Text className="text-sm text-ink-2">Nenhum mapa encontrado</Text>
      </View>
    );
  }

  return (
    <View>
      {maps.map((m, i) => (
        <MapCard key={`${m.game_slug}-${m.map_name}-${m.order}`} map={m} first={i === 0} />
      ))}
    </View>
  );
}
