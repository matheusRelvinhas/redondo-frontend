import { View, Text, Pressable, ScrollView } from "react-native";
import { Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { PlayerImage } from "./entity-image";
import { Panel, PillTabs } from "./ui";
import { useAppContext } from "@/context/context";
import { colorsFor } from "@/lib/colors";
import { ratingColor, ratingPercent, toRating } from "@/lib/rating";
import {
  STAT_GROUPS,
  formatStat,
  statHint,
  statLabel,
  statValue,
  type ColumnKey,
  type PlayerStats,
} from "@/lib/players";

const PLAYER_WIDTH = 190;
const STAT_WIDTH = 68;
const PERIOD_WIDTH = 128;
const RATING_WIDTH = 74;

const widthOf = (key: ColumnKey) => (key === "period" ? PERIOD_WIDTH : STAT_WIDTH);

export function StatGroupTabs({
  value,
  onChange,
}: {
  value: string;
  onChange: (group: (typeof STAT_GROUPS)[number]) => void;
}) {
  return (
    <PillTabs
      value={value}
      options={STAT_GROUPS.map((g) => ({ label: g.title, value: g.title }))}
      onChange={(title) => onChange(STAT_GROUPS.find((g) => g.title === title)!)}
    />
  );
}

/** O que cada sigla do cabeçalho significa; a coluna ordenada fica destacada. */
export function StatsLegend({ columns, sort }: { columns: ColumnKey[]; sort?: ColumnKey }) {
  return (
    <View className="flex-row flex-wrap gap-x-3 gap-y-1 px-1">
      {[...columns, "avg_player_rating" as ColumnKey].map((key) => {
        const active = key === sort;
        return (
          <View key={key} className="flex-row items-center gap-1">
            <Text
              className={`text-[10px] font-extrabold uppercase ${
                active ? "text-primary" : "text-ink-2"
              }`}
            >
              {statLabel(key)}
            </Text>
            <Text className={`text-[10.5px] ${active ? "text-ink-2" : "text-ink-3"}`}>
              — {statHint(key)}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

function HeaderCell({
  label,
  width,
  active,
  desc,
  onPress,
  accent,
}: {
  label: string;
  width: number;
  active: boolean;
  desc: boolean;
  onPress: () => void;
  accent: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{ width }}
      className="flex-row items-center justify-center gap-0.5 px-1 py-2"
    >
      <Text
        numberOfLines={1}
        className={`text-[10px] font-extrabold uppercase tracking-wide ${
          active ? "text-primary" : "text-ink-3"
        }`}
      >
        {label}
      </Text>
      {active ? (
        <Ionicons name={desc ? "chevron-down" : "chevron-up"} size={11} color={accent} />
      ) : null}
    </Pressable>
  );
}

function Rating({ value, dark }: { value: number | null; dark: boolean }) {
  if (value === null) {
    return <Text className="text-xs text-ink-3">–</Text>;
  }

  const rating = toRating(value);
  return (
    <>
      <Text className="font-display text-xs font-bold text-ink">{rating.toFixed(2)}</Text>
      <View className="h-1 w-full overflow-hidden rounded-sm bg-surface-3">
        <View
          className="h-full rounded-sm"
          style={{ width: `${ratingPercent(rating)}%`, backgroundColor: ratingColor(rating, dark) }}
        />
      </View>
    </>
  );
}

function PlayerCell({ player, rank }: { player: PlayerStats; rank: number }) {
  return (
    <View
      style={{ width: PLAYER_WIDTH }}
      className="flex-row items-center gap-2 py-1.5 pl-3 pr-1"
    >
      <Text className="w-5 text-[11px] font-bold text-ink-3">{rank}</Text>
      <PlayerImage imgUrl={player.img_url} size={32} />
      <View className="min-w-0 flex-1">
        <View className="flex-row items-center gap-1.5">
          <Text numberOfLines={1} className="min-w-0 font-bold text-ink">
            {player.nickname}
          </Text>
          <Text className="text-[8.5px] font-extrabold text-ink-3">{player.country_code}</Text>
        </View>
        <Text numberOfLines={1} className="text-[10px] text-ink-2">
          {player.team_name ?? `${player.first_name ?? ""} ${player.last_name ?? ""}`.trim()}
        </Text>
      </View>
    </View>
  );
}

export function PlayerStatsTable({
  rows,
  columns,
  sort,
  desc,
  onSort,
  showPlayer = true,
  loading,
  error,
}: {
  rows: PlayerStats[];
  columns: ColumnKey[];
  sort: ColumnKey;
  desc: boolean;
  onSort: (key: ColumnKey) => void;
  /** false na página do jogador, onde cada linha é um período. */
  showPlayer?: boolean;
  loading?: boolean;
  error?: boolean;
}) {
  const { theme } = useAppContext();
  const c = colorsFor(theme);
  const dark = theme === "dark";

  if (loading || error || !rows.length) {
    return (
      <Panel className="items-center justify-center gap-2 p-8">
        {loading ? (
          <Text className="text-sm text-ink-3">Carregando…</Text>
        ) : (
          <>
            <Ionicons
              name={error ? "cloud-offline-outline" : "alert-circle-outline"}
              size={22}
              color={c.ink3}
            />
            <Text className="text-sm text-ink-2">
              {error
                ? "Não foi possível carregar os jogadores"
                : "Nenhum jogador encontrado"}
            </Text>
          </>
        )}
      </Panel>
    );
  }

  const minWidth =
    (showPlayer ? PLAYER_WIDTH : 0) +
    columns.reduce((sum, key) => sum + widthOf(key), 0) +
    RATING_WIDTH;

  const cell = (row: PlayerStats, key: ColumnKey) => {
    const value = statValue(row, key);
    return (
      <View key={key} style={{ width: widthOf(key) }} className="items-center px-1 py-2.5">
        <Text numberOfLines={1} className="text-xs font-semibold text-ink-2">
          {value === null ? "–" : formatStat(key, value)}
        </Text>
      </View>
    );
  };

  return (
    <View
      style={{ alignSelf: "flex-start", maxWidth: "100%" }}
      className="overflow-hidden rounded-lg border border-line bg-surface"
    >
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ minWidth }}>
          <View className="flex-row border-b border-line bg-surface-2">
            {showPlayer ? (
              <View
                style={{ width: PLAYER_WIDTH }}
                className="justify-center py-2 pl-3 pr-1"
              >
                <Text className="text-[10px] font-extrabold uppercase tracking-wide text-ink-3">
                  Jogador
                </Text>
              </View>
            ) : null}

            {columns.map((key) => (
              <HeaderCell
                key={key}
                label={statLabel(key)}
                width={widthOf(key)}
                active={sort === key}
                desc={desc}
                onPress={() => onSort(key)}
                accent={c.primary}
              />
            ))}

            <HeaderCell
              label="Rating"
              width={RATING_WIDTH}
              active={sort === "avg_player_rating"}
              desc={desc}
              onPress={() => onSort("avg_player_rating")}
              accent={c.primary}
            />
          </View>

          {rows.map((row, i) => {
            const key = `${row.slug ?? "row"}-${row.period ?? i}`;

            const content = (
              <>
                {showPlayer ? <PlayerCell player={row} rank={i + 1} /> : null}
                {columns.map((column) => cell(row, column))}
                <View
                  style={{ width: RATING_WIDTH }}
                  className="items-center justify-center gap-1 px-2.5"
                >
                  <Rating value={row.avg_player_rating} dark={dark} />
                </View>
              </>
            );

            const className = `flex-row items-center ${i ? "border-t border-line" : ""}`;

            if (!showPlayer || !row.slug) {
              return (
                <View key={key} className={className}>
                  {content}
                </View>
              );
            }

            return (
              <Link
                key={key}
                href={{ pathname: "/player/[slug]", params: { slug: row.slug } }}
                asChild
              >
                <Pressable className={`${className} transition-colors duration-300 hover:bg-primary/10 active:bg-primary/10`}>{content}</Pressable>
              </Link>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}
