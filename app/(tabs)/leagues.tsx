import { useMemo, useState } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Screen, PageTitle } from "@/components/screen";
import { Seo } from "@/components/seo";
import { leaguesSeo } from "@/lib/seo";
import { Panel, Segmented, Chip } from "@/components/ui";
import { LeagueList } from "@/components/league-card";
import { Sheet, Field } from "@/components/sheet";
import { Select } from "@/components/select";
import { useAppContext } from "@/context/context";
import { colorsFor } from "@/lib/colors";
import { usePagination } from "@/lib/games";
import {
  TIER_OPTIONS,
  filterLeagues,
  useLeagues,
  yearOptions,
  type LeagueStatus,
  type Tier,
} from "@/lib/leagues";

export default function LeaguesScreen() {
  const { theme } = useAppContext();
  const iconColor = colorsFor(theme).ink3;

  const [status, setStatus] = useState<LeagueStatus>("finished");
  const [search, setSearch] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [tier, setTier] = useState<Tier>("s-a");
  const [year, setYear] = useState(String(new Date().getFullYear()));

  // em "atual" o project-x fixa o ano corrente
  const years = useMemo(
    () => (status === "current" ? [String(new Date().getFullYear())] : [year]),
    [status, year]
  );

  const { leagues, upcoming, loading, error } = useLeagues(status, years);

  const list = useMemo(
    () => filterLeagues(leagues, { search, tier, status }),
    [leagues, search, tier, status]
  );
  const nextList = useMemo(
    () => filterLeagues(upcoming, { search, tier, status }),
    [upcoming, search, tier, status]
  );

  const { visible, hasMore, showMore } = usePagination(list, 10);

  const activeFilters = (tier !== "s-a" ? 1 : 0) + (status === "finished" ? 1 : 0);

  return (
    <Screen onEndReached={hasMore ? showMore : undefined}>
      <Seo {...leaguesSeo()} />

      <PageTitle title="Campeonatos" subtitle="Tier S e A" />

      <View className="flex-row gap-2">
        <View className="h-10 flex-1 flex-row items-center gap-2 rounded-xl border border-line bg-surface px-3">
          <Ionicons name="search" size={16} color={iconColor} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Nome do campeonato…"
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

      <Segmented
        value={status}
        onChange={setStatus}
        options={[
          { label: "Finalizados", value: "finished" },
          { label: "Atuais", value: "current" },
        ]}
      />

      <View className="flex-row flex-wrap gap-1.5">
        <Chip label={TIER_OPTIONS.find((t) => t.value === tier)!.label} tone="outline" />
        {status === "finished" ? <Chip label={year} tone="outline" /> : null}
        {loading ? null : <Chip label={`${list.length} campeonatos`} tone="outline" />}
      </View>

      <Panel className="overflow-hidden">
        <LeagueList leagues={visible} loading={loading} error={error} />
      </Panel>

      {hasMore ? (
        <Pressable onPress={showMore} className="items-center py-2">
          <Text className="text-xs font-bold text-ink-3">
            Carregando mais… ({visible.length} de {list.length})
          </Text>
        </Pressable>
      ) : null}

      {status === "current" && nextList.length ? (
        <>
          <Text className="mt-1 text-[13px] font-extrabold text-ink">Próximos</Text>
          <Panel className="overflow-hidden">
            <LeagueList leagues={nextList} />
          </Panel>
        </>
      ) : null}

      <Sheet
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        title="Filtros"
        footer={
          <View className="flex-row gap-2.5">
            <Pressable
              onPress={() => {
                setTier("s-a");
                setYear(String(new Date().getFullYear()));
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
                Aplicar · {list.length} campeonatos
              </Text>
            </Pressable>
          </View>
        }
      >
        <Field label="Tier">
          <Select
            title="Selecione um tier"
            options={TIER_OPTIONS}
            value={tier}
            onChange={(v) => setTier(v ?? "s-a")}
          />
        </Field>

        {status === "finished" ? (
          <Field label="Ano">
            <Select
              title="Selecione um ano"
              options={yearOptions().map((y) => ({ label: y, value: y }))}
              value={year}
              onChange={(v) => setYear(v ?? String(new Date().getFullYear()))}
            />
          </Field>
        ) : null}
      </Sheet>
    </Screen>
  );
}
