import { useEffect, useMemo, useState } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Screen, PageTitle } from "@/components/screen";
import { Seo } from "@/components/seo";
import { teamsSeo } from "@/lib/seo";
import { Panel, Chip, PillTabs } from "@/components/ui";
import { TeamList } from "@/components/team-card";
import { Sheet, Field } from "@/components/sheet";
import { MultiSelect } from "@/components/select";
import { useAppContext } from "@/context/context";
import { colorsFor } from "@/lib/colors";
import { usePagination } from "@/lib/games";
import {
  REGIONS,
  countryOptions,
  filterTeams,
  regionRanks,
  useTeams,
  type Region,
} from "@/lib/teams";

export default function TeamsScreen() {
  const { theme } = useAppContext();
  const iconColor = colorsFor(theme).ink3;

  const [region, setRegion] = useState<Region>("all");
  const [search, setSearch] = useState("");
  const [countries, setCountries] = useState<string[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const { teams, loading, error } = useTeams(region);

  // trocar de região zera os países, como no project-x
  useEffect(() => setCountries([]), [region]);

  const countryList = useMemo(() => countryOptions(teams), [teams]);
  const list = useMemo(() => filterTeams(teams, { search, countries }), [
    teams,
    search,
    countries,
  ]);

  const ranks = useMemo(
    () => (region === "all" ? undefined : regionRanks(teams)),
    [teams, region]
  );

  const { visible, hasMore, showMore } = usePagination(list, 10);

  const regionLabel = REGIONS.find((r) => r.value === region)!.label;

  return (
    <Screen onEndReached={hasMore ? showMore : undefined}>
      <Seo {...teamsSeo()} />

      <PageTitle title="Times" subtitle="Ranking Valve" />

      <View className="flex-row gap-2">
        <View className="h-10 flex-1 flex-row items-center gap-2 rounded-xl border border-line bg-surface px-3">
          <Ionicons name="search" size={16} color={iconColor} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Nome do time ou país…"
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
          {countries.length ? (
            <View className="h-4 min-w-[16px] items-center justify-center rounded-lg bg-primary px-1">
              <Text className="text-[10px] font-bold text-primary-ink">
                {countries.length}
              </Text>
            </View>
          ) : null}
        </Pressable>
      </View>

      <PillTabs
        value={region}
        onChange={setRegion}
        options={REGIONS.map((r) => ({ label: r.label, value: r.value }))}
      />

      <View className="flex-row flex-wrap gap-1.5">
        <Chip label={regionLabel} tone="outline" />
        {countryList
          .filter((c) => countries.includes(c.value))
          .map((c) => (
            <Chip key={c.value} label={c.label} tone="outline" />
          ))}
        {loading ? null : <Chip label={`${list.length} times`} tone="outline" />}
      </View>

      <Panel className="overflow-hidden">
        <TeamList teams={visible} loading={loading} error={error} ranks={ranks} />
      </Panel>

      {hasMore ? (
        <Pressable onPress={showMore} className="items-center py-2">
          <Text className="text-xs font-bold text-ink-3">
            Carregando mais… ({visible.length} de {list.length})
          </Text>
        </Pressable>
      ) : null}

      <Sheet open={filtersOpen} onClose={() => setFiltersOpen(false)} title="Filtros">
        <Field label="Países">
          <MultiSelect
            title="Selecione países"
            placeholder="Todos os países"
            options={countryList}
            value={countries}
            onChange={setCountries}
          />
        </Field>
      </Sheet>
    </Screen>
  );
}
