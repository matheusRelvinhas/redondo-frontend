import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { GameStats } from "@/lib/types";
import { Logo } from "./logo";
import { useAppContext } from "@/context/context";
import { colorsFor } from "@/lib/colors";


export function AiChip({ game, className = "" }: { game: GameStats; className?: string }) {
  const { theme } = useAppContext();
  if (!game.ai_predictions) return null;

  const finished = game.status === "finished";
  const [p1, p2] = game.ai_predictions.split("-").map(Number);
  const exact = finished && `${game.team1_score}-${game.team2_score}` === game.ai_predictions;
  const hitWinner =
    finished && p1 > p2 === ((game.team1_score ?? 0) > (game.team2_score ?? 0));

  const box = exact
    ? "bg-success/15"
    : hitWinner || !finished
      ? "bg-primary/15"
      : "bg-surface-2";
  const text = exact
    ? "text-success"
    : hitWinner || !finished
      ? "text-primary"
      : "text-ink-3";

  return (
    <View
      className={`h-[22px] flex-row items-center gap-1.5 rounded-[7px] px-2 ${box} ${className}`}
    >
      <Logo size={12} />
      <Text className={`text-[11px] font-bold ${text}`}>
        IA {game.ai_predictions.replace("-", "–")}
      </Text>
      {exact ? <Ionicons name="checkmark" size={11} color={colorsFor(theme).success} /> : null}
    </View>
  );
}
