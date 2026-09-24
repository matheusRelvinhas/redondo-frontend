import { useMemo, useState } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Screen, PageTitle } from "@/components/screen";
import { Panel, Segmented, Chip } from "@/components/ui";
import { GameList } from "@/components/game-card";
import { LiveGames } from "@/components/live-games";
import { Sheet, Field } from "@/components/sheet";
import { Select } from "@/components/select";
import { useAppContext } from "@/context/context";
import {
  periodLabel,
  usePagination,
  useCurrentGames,
  useFilters,
  useGames,
} from "@/lib/games";

type FilterBy = "period" | "leagues";

export default function GamesScreen() {
  const { theme } = useAppContext();
  const iconColor = theme === "dark" ? "#6f6f73" : "#9a9a9a";

  const [status, setStatus] = useState<"finished" | "upcoming">("finished");
  const [search, setSearch] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [filterBy, setFilterBy] = useState<FilterBy>("period");
  const [period, setPeriod] = useState("last_15");
  const [league, setLeague] = useState<string | null>(null);
  const [team, setTeam] = useState<string | null>(null);

  const { periods, leagues, teams } = useFilters();
  const liveGames = useCurrentGames();
  const { games, loading, error } = useGames(
    status,
    period,
    filterBy === "leagues" ? (league ?? undefined) : undefined
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = games;

    if (team) {
      list = list.filter((g) => g.team1_slug === team || g.team2_slug === team);
    }
    if (q) {
      list = list.filter((g) =>
        [g.team1_name, g.team2_name, g.league_name, g.team1_slug, g.team2_slug]
          .filter(Boolean)
          .some((v) => v!.toLowerCase().includes(q))
      );
    }
    return list;
  }, [games, search, team]);

  const { visible, hasMore, showMore } = usePagination(filtered, 10);

  const activeFilters = (team ? 1 : 0) + (status === "finished" ? 1 : 0);
  const periodOptions = [
    { label: periodLabel("last_15"), value: "last_15" },
    ...periods.map((p) => ({ label: periodLabel(p), value: p })),
  ];

  const clearFilters = () => {
    setFilterBy("period");
    setPeriod("last_15");
    setLeague(null);
    setTeam(null);
  };

  return (
    <Screen onEndReached={hasMore ? showMore : undefined}>
      <PageTitle title="Jogos" subtitle="Tier S e A" />

      <View className="flex-row gap-2">
        <View className="h-10 flex-1 flex-row items-center gap-2 rounded-xl border border-line bg-surface px-3">
          <Ionicons name="search" size={16} color={iconColor} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Time, campeonato..."
            placeholderTextColor={iconColor}
            className="min-w-0 flex-1 text-[13px] text-ink"
          />
        </View>
        <Pressable
          onPress={() => setFiltersOpen(true)}
          disabled={status === "upcoming"}
          className={`h-10 flex-row items-center gap-2 rounded-xl border border-line-2 bg-surface px-3.5 ${
            status === "upcoming" ? "opacity-40" : ""
          }`}
        >
          <Ionicons name="options-outline" size={17} color={iconColor} />
          <Text className="text-[13px] font-bold text-ink">Filtros</Text>
          {activeFilters > 0 && status === "finished" ? (
            <View className="h-4 min-w-[16px] items-center justify-center rounded-lg bg-primary px-1">
              <Text className="text-[10px] font-bold text-primary-ink">{activeFilters}</Text>
            </View>
          ) : null}
        </Pressable>
      </View>

      <LiveGames games={liveGames} />

      <Segmented
        value={status}
        onChange={setStatus}
        options={[
          { label: "Finalizados", value: "finished" },
          { label: "Próximos", value: "upcoming" },
        ]}
      />

      <View className="flex-row flex-wrap gap-1.5">
        {status === "finished" ? (
          <Chip
            label={
              filterBy === "period"
                ? periodLabel(period)
                : (leagues.find((l) => l.slug === league)?.name ?? "Todas as ligas")
            }
            tone="outline"
          />
        ) : (
          <Chip label="Próximos jogos" tone="outline" />
        )}
        {team ? (
          <Pressable onPress={() => setTeam(null)}>
            <Chip label={teams.find((t) => t.slug === team)?.name ?? team} tone="primary" />
          </Pressable>
        ) : null}
        {loading ? null : <Chip label={`${filtered.length} jogos`} tone="outline" />}
      </View>

      <Panel className="overflow-hidden">
        <GameList games={visible} loading={loading} error={error} />
      </Panel>

      {hasMore ? (
        <Pressable onPress={showMore} className="items-center py-2">
          <Text className="text-xs font-bold text-ink-3">
            Carregando mais… ({visible.length} de {filtered.length})
          </Text>
        </Pressable>
      ) : null}

      <Sheet
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        title="Filtros"
        footer={
          <View className="flex-row gap-2.5">
            <Pressable
              onPress={clearFilters}
              className="h-10 flex-1 items-center justify-center rounded-xl border border-line-2"
            >
              <Text className="text-[13px] font-bold text-ink-2">Limpar</Text>
            </Pressable>
            <Pressable
              onPress={() => setFiltersOpen(false)}
              className="h-10 flex-[2] items-center justify-center rounded-xl bg-primary"
            >
              <Text className="text-[13px] font-bold text-primary-ink">
                Aplicar · {filtered.length} jogos
              </Text>
            </Pressable>
          </View>
        }
      >
        <Field label="Filtrar por">
          <Segmented
            value={filterBy}
            onChange={(v) => {
              setFilterBy(v);
              if (v === "period") setLeague(null);
            }}
            options={[
              { label: "Período", value: "period" },
              { label: "Ligas", value: "leagues" },
            ]}
          />
        </Field>

        {filterBy === "period" ? (
          <Field label="Período">
            <Select
              title="Selecione um período"
              options={periodOptions}
              value={period}
              onChange={(v) => setPeriod(v ?? "last_15")}
            />
          </Field>
        ) : (
          <Field label="Liga">
            <Select
              title="Selecione uma liga"
              placeholder="Selecione uma liga"
              options={leagues.map((l) => ({ label: l.name, value: l.slug }))}
              value={league}
              onChange={setLeague}
              emptyLabel="Todas as ligas"
            />
          </Field>
        )}

        <Field label="Time">
          <Select
            title="Selecione um time"
            placeholder="Selecione um time"
            options={teams.map((t) => ({ label: t.name, value: t.slug }))}
            value={team}
            onChange={setTeam}
            emptyLabel="Todos os times"
          />
        </Field>
      </Sheet>
    </Screen>
  );
}
