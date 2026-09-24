import { View, Text, ScrollView } from "react-native";
import { Panel, Chip, Eyebrow } from "./ui";
import { TeamImage } from "./entity-image";
import { GameIcon, type IconName } from "./game-icons";
import { useAppContext } from "@/context/context";
import { mapName } from "@/lib/format";
import type { GameSideInfo, GameStats } from "@/lib/types";

const ICON_BY_REASON: Record<string, IconName> = {
  CTWin: "skull",
  TerroristsWin: "skull",
  TargetBombed: "mineExplosion",
  BombDefused: "pliers",
  TargetSaved: "clock8",
};

const SIDE_COLORS = {
  dark: { CT: "#85a5ff", T: "#ffd666" },
  light: { CT: "#3b62e6", T: "#e07a00" },
};

function SideBadge({ side, color }: { side: "CT" | "T"; color: string }) {
  return (
    <View
      className="h-[14px] w-[18px] items-center justify-center rounded"
      style={{ backgroundColor: color }}
    >
      <Text className="text-[8px] font-extrabold" style={{ color: "#111" }}>
        {side === "CT" ? "CT" : "TR"}
      </Text>
    </View>
  );
}

function RoundCell({ won, color, icon }: { won: boolean; color: string; icon?: IconName }) {
  return (
    <View
      className="h-[18px] w-[18px] items-center justify-center rounded-md bg-surface-2"
      style={won ? { backgroundColor: `${color}2e` } : undefined}
    >
      {won && icon ? <GameIcon name={icon} size={11} color={color} /> : null}
    </View>
  );
}

export function GameSide({
  gamesSide,
  filterMap,
  game,
}: {
  gamesSide: GameSideInfo[];
  filterMap: string;
  game: GameStats;
}) {
  const { theme } = useAppContext();
  const sideColor = SIDE_COLORS[theme];

  const mapSide = gamesSide.find((g) => g.map_name === filterMap);
  if (!mapSide?.game_side?.length) return null;

  const summary: string[] = [];
  let pointer = 0;

  const halves = mapSide.game_side.map((half, index) => {
    const total = half.winner_clan_score + half.loser_clan_score;
    const rounds = mapSide.game_rounds.slice(pointer, pointer + total);
    pointer += total;

    const ctTeam =
      half.winner_clan_side === "CT" ? half.winner_clan_slug : half.loser_clan_slug;
    const team1Side: "CT" | "T" = game.team1_slug === ctTeam ? "CT" : "T";
    const team2Side: "CT" | "T" = team1Side === "CT" ? "T" : "CT";

    const team1Score =
      half.winner_clan_slug === game.team1_slug
        ? half.winner_clan_score
        : half.loser_clan_score;
    const team2Score = total - team1Score;

    summary.push(
      `${half.overtime ? "OT" : `${index + 1}º tempo`} ${team1Score}–${team2Score}`
    );

    return { half, rounds, team1Side, team2Side, team1Score, team2Score, index };
  });

  return (
    <View className="gap-2">
      <View className="flex-row items-center justify-between gap-2">
        <Eyebrow>{`Rounds · ${mapName(filterMap)}`}</Eyebrow>
        <Chip label={summary.join(" · ")} tone="outline" />
      </View>

      <Panel className="gap-2.5 px-3.5 py-3">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View className="flex-row gap-2.5">
          {halves.map(
            ({ half, rounds, team1Side, team2Side, team1Score, team2Score, index }) => (
              <View key={index} className="flex-row items-center gap-1.5">
                <View className="gap-1">
                  <View className="h-[18px] flex-row items-center gap-1.5">
                    <TeamImage imgUrl={game.team1_img_url} size={16} />
                    <SideBadge side={team1Side} color={sideColor[team1Side]} />
                  </View>
                  <View className="h-[10px]" />
                  <View className="h-[18px] flex-row items-center gap-1.5">
                    <TeamImage imgUrl={game.team2_img_url} size={16} />
                    <SideBadge side={team2Side} color={sideColor[team2Side]} />
                  </View>
                </View>

                <View className="flex-row gap-[3px]">
                  {rounds.map((round) => {
                    const team1Won = round.winner_clan_slug === game.team1_slug;
                    const icon = ICON_BY_REASON[round.end_reason];
                    return (
                      <View key={round.round_number} className="items-center gap-1">
                        <RoundCell
                          won={team1Won}
                          color={sideColor[team1Side]}
                          icon={icon}
                        />
                        <Text className="h-[10px] text-[8px] font-bold leading-[10px] text-ink-3">
                          {round.round_number}
                        </Text>
                        <RoundCell
                          won={!team1Won}
                          color={sideColor[team2Side]}
                          icon={icon}
                        />
                      </View>
                    );
                  })}
                </View>

                <View className="gap-1">
                  <View className="h-[18px] min-w-[22px] items-center justify-center rounded-md bg-surface-2">
                    <Text
                      className={`font-display text-[11px] font-bold ${
                        team1Score > team2Score ? "text-success" : "text-danger"
                      }`}
                    >
                      {team1Score}
                    </Text>
                  </View>
                  <View className="h-[10px] items-center justify-center">
                    {half.overtime ? (
                      <Text className="text-[8px] font-black text-primary">OT</Text>
                    ) : null}
                  </View>
                  <View className="h-[18px] min-w-[22px] items-center justify-center rounded-md bg-surface-2">
                    <Text
                      className={`font-display text-[11px] font-bold ${
                        team2Score > team1Score ? "text-success" : "text-danger"
                      }`}
                    >
                      {team2Score}
                    </Text>
                  </View>
                </View>
              </View>
            )
          )}
        </View>
      </ScrollView>

      <View className="flex-row flex-wrap gap-3">
        {(
          [
            { icon: "skull", label: "eliminação" },
            { icon: "mineExplosion", label: "bomba explodiu" },
            { icon: "pliers", label: "defuse" },
            { icon: "clock8", label: "tempo" },
          ] as { icon: IconName; label: string }[]
        ).map((item) => (
          <View key={item.icon} className="flex-row items-center gap-1.5">
            <GameIcon
              name={item.icon}
              size={11}
              color={theme === "dark" ? "#6f6f73" : "#9a9a9a"}
            />
            <Text className="text-[10.5px] font-semibold text-ink-3">{item.label}</Text>
          </View>
        ))}
        </View>
      </Panel>
    </View>
  );
}
