import { useMemo, useState } from "react";
import { View, Text, Pressable, Modal, TextInput, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppContext } from "@/context/context";
import { colorsFor } from "@/lib/colors";

export type Option<T extends string> = { label: string; value: T };

export function Select<T extends string>({
  value,
  options,
  onChange,
  placeholder = "Selecione",
  title,
  emptyLabel,
  searchable,
}: {
  value: T | null;
  options: Option<T>[];
  onChange: (value: T | null) => void;
  placeholder?: string;
  title?: string;
  emptyLabel?: string;
  searchable?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { theme, isDesktop } = useAppContext();

  const c = colorsFor(theme);
  const iconColor = c.ink2;
  const mutedColor = c.ink3;
  const accent = c.primary;

  const withSearch = searchable ?? options.length > 8;
  const selected = options.find((o) => o.value === value);

  const rows = useMemo(() => {
    const base: Option<T | "">[] = emptyLabel
      ? [{ label: emptyLabel, value: "" as T | "" }, ...options]
      : [...options];
    const q = query.trim().toLowerCase();
    if (!q) return base;
    return base.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query, emptyLabel]);

  const close = () => {
    setOpen(false);
    setQuery("");
  };

  const pick = (v: T | "") => {
    onChange(v === "" ? null : (v as T));
    close();
  };

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        className="h-11 flex-row items-center justify-between gap-2 rounded-xl border border-line-2 bg-bg px-3"
      >
        <Text
          numberOfLines={1}
          className={`min-w-0 flex-1 text-[13px] ${
            selected ? "font-semibold text-ink" : "text-ink-3"
          }`}
        >
          {selected?.label ?? emptyLabel ?? placeholder}
        </Text>
        <Ionicons name="chevron-down" size={16} color={iconColor} />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={close}>
        <Pressable
          onPress={close}
          className={`flex-1 bg-black/60 ${
            isDesktop ? "items-center justify-center p-6" : "justify-end"
          }`}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            className={`w-full gap-3 bg-surface px-4 pb-6 pt-3 ${
              isDesktop ? "max-w-md rounded-2xl border border-line p-5" : "rounded-t-[22px]"
            }`}
          >
            {isDesktop ? null : <View className="mx-auto h-1 w-10 rounded-sm bg-line-2" />}

            <View className="flex-row items-center justify-between gap-2">
              <Text className="text-[15px] font-extrabold text-ink">
                {title ?? placeholder}
              </Text>
              <Pressable
                onPress={close}
                hitSlop={8}
                className="h-8 w-8 items-center justify-center rounded-[10px] border border-line"
              >
                <Ionicons name="close" size={16} color={iconColor} />
              </Pressable>
            </View>

            {withSearch ? (
              <View className="h-10 flex-row items-center gap-2 rounded-xl border border-line bg-bg px-3">
                <Ionicons name="search" size={15} color={mutedColor} />
                <TextInput
                  value={query}
                  onChangeText={setQuery}
                  placeholder="Buscar…"
                  placeholderTextColor={mutedColor}
                  autoFocus={isDesktop}
                  className="min-w-0 flex-1 text-[13px] text-ink"
                />
              </View>
            ) : null}

            <View
              className="rounded-xl border border-line"
              style={{ maxHeight: 360, overflow: "hidden" }}
            >
              <ScrollView
                nestedScrollEnabled
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator
              >
                {rows.length === 0 ? (
                  <View className="items-center justify-center py-6">
                    <Text className="text-[13px] text-ink-3">Nada encontrado</Text>
                  </View>
                ) : (
                  rows.map((opt, i) => {
                    const active = (opt.value === "" ? null : opt.value) === value;
                    return (
                      <Pressable
                        key={opt.value || "__all__"}
                        onPress={() => pick(opt.value)}
                        className={`flex-row items-center justify-between gap-2 px-3 py-2.5 ${
                          i ? "border-t border-line" : ""
                        } ${active ? "bg-primary/10" : ""}`}
                      >
                        <Text
                          numberOfLines={1}
                          className={`min-w-0 flex-1 text-[13px] ${
                            active ? "font-bold text-primary" : "font-semibold text-ink-2"
                          }`}
                        >
                          {opt.label}
                        </Text>
                        {active ? <Ionicons name="checkmark" size={16} color={accent} /> : null}
                      </Pressable>
                    );
                  })
                )}
              </ScrollView>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
