import { View, Text } from "react-native";
import { Panel } from "./ui";
import { GameList } from "./game-card";
import { LiveDot } from "./live-dot";
import type { GameStats } from "@/lib/types";

export function LiveGames({ games }: { games: GameStats[] }) {
  if (!games.length) return null;

  return (
    <Panel className="overflow-hidden">
      <View className="flex-row items-center justify-between gap-2 px-4 pt-3">
        <View className="flex-row items-center gap-2">
          <LiveDot />
          <Text className="text-[13px] font-extrabold text-ink">Ao vivo</Text>
        </View>
        <Text className="text-[11px] font-bold text-ink-2">
          {games.length} {games.length > 1 ? "partidas" : "partida"}
        </Text>
      </View>
      <View className="mt-2">
        <GameList games={games} live />
      </View>
    </Panel>
  );
}
