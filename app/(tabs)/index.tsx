import { useState } from "react";
import { View, Text } from "react-native";
import { Screen, PageTitle } from "@/components/screen";
import { Panel, StatTile, Segmented, Eyebrow, Chip } from "@/components/ui";
import { GameList } from "@/components/game-card";
import { LiveGames } from "@/components/live-games";
import { AiChart } from "@/components/ai-chart";
import { useAiPerformance, useCurrentGames, useGames } from "@/lib/games";

export default function HomeScreen() {
  const [status, setStatus] = useState<"finished" | "upcoming">("finished");

  const {
    games: aiGames,
    total,
    winnerHits,
    exactHits,
    loading: loadingAi,
  } = useAiPerformance();
  const { games, loading, error } = useGames(status);
  const liveGames = useCurrentGames();

  const winnerPct = total ? (winnerHits / total) * 100 : 0;
  const exactPct = total ? (exactHits / total) * 100 : 0;
  const fmt = (n: number) => n.toFixed(1).replace(".", ",");

  return (
    <Screen>
      <View className="gap-1">
        <Eyebrow>Previsões da IA</Eyebrow>
        <PageTitle
          title="Desempenho"
          subtitle={
            loadingAi
              ? "Carregando…"
              : `${total.toLocaleString("pt-BR")} partidas previstas · tier S e A`
          }
        />
      </View>

      <View className="flex-row gap-2.5">
        <StatTile
          label="Vencedor certo"
          value={fmt(winnerPct)}
          suffix="%"
          detail={`${winnerHits} de ${total.toLocaleString("pt-BR")}`}
          percent={winnerPct}
          color="primary"
        />
        <StatTile
          label="Placar exato"
          value={fmt(exactPct)}
          suffix="%"
          detail={`${exactHits} de ${total.toLocaleString("pt-BR")}`}
          percent={exactPct}
          color="success"
        />
      </View>

      <Panel className="gap-1 px-3 pb-3 pt-3">
        <View className="flex-row items-center justify-between gap-2 px-1">
          <Text className="text-[13px] font-extrabold text-ink">Acertos acumulados</Text>
          <Chip label="por partida" />
        </View>
        <AiChart games={aiGames} loading={loadingAi} />
      </Panel>

      <LiveGames games={liveGames} />

      <View className="mt-1 flex-row items-center justify-between gap-3">
        <Text className="text-[17px] font-extrabold text-ink">Jogos</Text>
        <Segmented
          value={status}
          onChange={setStatus}
          options={[
            { label: "Finalizados", value: "finished" },
            { label: "Próximos", value: "upcoming" },
          ]}
        />
      </View>

      <Panel className="overflow-hidden">
        <GameList games={games.slice(0, 12)} loading={loading} error={error} />
      </Panel>
    </Screen>
  );
}
