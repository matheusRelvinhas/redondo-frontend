import { useMemo, useState } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Screen, PageTitle } from "@/components/screen";
import { Seo } from "@/components/seo";
import { playersSeo } from "@/lib/seo";
import { Chip } from "@/components/ui";
import {
  PlayerStatsTable,
  StatGroupTabs,
  StatsLegend,
} from "@/components/player-stats-table";
import { Sheet, Field } from "@/components/sheet";
import { MultiSelect, Select } from "@/components/select";
import { useAppContext } from "@/context/context";
import { colorsFor } from "@/lib/colors";
import { usePagination } from "@/lib/games";
import {
  DEFAULT_GAME_COUNT,
  DEFAULT_PERIOD,
  GAME_COUNT_OPTIONS,
  PERIOD_OPTIONS,
  STAT_GROUPS,
  countryOptions,
  filterPlayers,
  periodText,
  sortPlayers,
  teamOptions,
  usePlayers,
  type ColumnKey,
} from "@/lib/players";

export default function PlayersScreen() {
  const { theme } = useAppContext();
  const iconColor = colorsFor(theme).ink3;

  const [period, setPeriod] = useState(DEFAULT_PERIOD);
  const [gameCount, setGameCount] = useState(DEFAULT_GAME_COUNT);
  const [countries, setCountries] = useState<string[]>([]);
  const [teams, setTeams] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [group, setGroup] = useState(STAT_GROUPS[0]);
  const [sort, setSort] = useState<ColumnKey>("avg_player_rating");
  const [desc, setDesc] = useState(true);

  const { players, loading, error } = usePlayers(period, gameCount);

  const countryList = useMemo(() => countryOptions(players), [players]);
  const teamList = useMemo(() => teamOptions(players), [players]);

  const filtered = useMemo(
    () => filterPlayers(players, { search, countries, teams }),
    [players, search, countries, teams]
  );
  const ranking = useMemo(() => sortPlayers(filtered, sort, desc), [filtered, sort, desc]);

  const { visible, hasMore, showMore } = usePagination(ranking, 10);

  const selectStat = (key: ColumnKey) => {
    if (key === sort) return setDesc(!desc);
    setSort(key);
    setDesc(true);
  };

  const selectGroup = (g: (typeof STAT_GROUPS)[number]) => {
    setGroup(g);
    setSort(g.stats[0]);
    setDesc(true);
  };

  const activeFilters =
    countries.length +
    teams.length +
    (period !== DEFAULT_PERIOD ? 1 : 0) +
    (gameCount !== DEFAULT_GAME_COUNT ? 1 : 0);

  return (
    <Screen onEndReached={hasMore ? showMore : undefined}>
      <Seo {...playersSeo()} />

      <PageTitle title="Jogadores" subtitle="Ranking e estatísticas" />

      <View className="flex-row gap-2">
        <View className="h-10 flex-1 flex-row items-center gap-2 rounded-xl border border-line bg-surface px-3">
          <Ionicons name="search" size={16} color={iconColor} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Nick, time ou país…"
            placeholderTextColor={iconColor}
            className="min-w-0 flex-1 text-[13px] text-ink"
          />
        </View>
        <Pressable
          onPress={() => setFiltersOpen(true)}
          className="h-10 flex-row items-center gap-2 rounded-xl border border-line-2 bg-surface px-3.5"
        >
          <Ionicons name="options-outline" size={17} color={iconColor} />
          <Text className="text-[13px] font-bold text-ink">Filtros</Text>
          {activeFilters > 0 ? (
            <View className="h-4 min-w-[16px] items-center justify-center rounded-lg bg-primary px-1">
              <Text className="text-[10px] font-bold text-primary-ink">{activeFilters}</Text>
            </View>
          ) : null}
        </Pressable>
      </View>

      <View className="flex-row flex-wrap gap-1.5">
        <Chip label={periodText(period)} tone="outline" />
        <Chip label={`No mínimo ${gameCount} mapas`} tone="outline" />
        {countries.map((code) => (
          <Chip key={code} label={code.toUpperCase()} tone="outline" />
        ))}
        {teamList
          .filter((t) => teams.includes(t.value))
          .map((t) => (
            <Chip key={t.value} label={t.label} tone="outline" />
          ))}
        {loading ? null : <Chip label={`${ranking.length} jogadores`} tone="outline" />}
      </View>

      <StatGroupTabs value={group.title} onChange={selectGroup} />

      <StatsLegend columns={group.stats} sort={sort} />

      <PlayerStatsTable
        rows={visible}
        columns={group.stats}
        sort={sort}
        desc={desc}
        onSort={selectStat}
        loading={loading}
        error={error}
      />

      {hasMore ? (
        <Pressable onPress={showMore} className="items-center py-2">
          <Text className="text-xs font-bold text-ink-3">
            Carregando mais… ({visible.length} de {ranking.length})
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
              onPress={() => {
                setPeriod(DEFAULT_PERIOD);
                setGameCount(DEFAULT_GAME_COUNT);
                setCountries([]);
                setTeams([]);
              }}
              className="h-10 flex-1 items-center justify-center rounded-xl border border-line-2"
            >
              <Text className="text-[13px] font-bold text-ink-2">Limpar</Text>
            </Pressable>
            <Pressable
              onPress={() => setFiltersOpen(false)}
              className="h-10 flex-[2] items-center justify-center rounded-xl bg-primary"
            >
              <Text className="text-[13px] font-bold text-primary-ink">
                Aplicar · {ranking.length} jogadores
              </Text>
            </Pressable>
          </View>
        }
      >
        <Field label="Período">
          <Select
            title="Selecione um período"
            options={PERIOD_OPTIONS.map((p) => ({ label: p.label, value: p.value }))}
            value={period}
            onChange={(v) => setPeriod(v ?? DEFAULT_PERIOD)}
          />
        </Field>

        <Field label="Quantidade mínima de mapas">
          <Select
            title="Selecione a quantidade de mapas"
            options={GAME_COUNT_OPTIONS}
            value={gameCount}
            onChange={(v) => setGameCount(v ?? DEFAULT_GAME_COUNT)}
          />
        </Field>

        <Field label="Nacionalidades">
          <MultiSelect
            title="Selecione nacionalidades"
            placeholder="Todas as nacionalidades"
            options={countryList}
            value={countries}
            onChange={setCountries}
          />
        </Field>

        <Field label="Times">
          <MultiSelect
            title="Selecione times"
            placeholder="Todos os times"
            options={teamList}
            value={teams}
            onChange={setTeams}
          />
        </Field>
      </Sheet>
    </Screen>
  );
}
