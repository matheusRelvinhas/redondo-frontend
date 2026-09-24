import { View, Text, Pressable } from "react-native";
import { Link, usePathname } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import { GameIcon } from "./game-icons";
import { LogoImage } from "./logo";
import { colorsFor } from "@/lib/colors";

export const NAV_ITEMS = [
  { name: "Início", href: "/", icon: "home" },
  { name: "Jogos", href: "/games", icon: "counterstrike" },
  { name: "Campeonatos", href: "/leagues", icon: "trophy" },
  { name: "Times", href: "/teams", icon: "people" },
  { name: "Jogadores", href: "/players", icon: "person" },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const c = colorsFor(isDark ? "dark" : "light");
  const accent = c.primary;
  const muted = c.ink2;

  return (
    <View className="h-full w-[232px] border-r border-line bg-surface px-3.5 py-4">
      <Link href="/" asChild>
        <Pressable className="mb-4 flex-row items-center gap-2.5 px-2 pb-4">
          <LogoImage size={34} />
          <View>
            <Text className="font-display text-sm font-bold tracking-[1.2px] text-ink">REDONDO STATS</Text>
            <Text className="mt-0.5 text-[10px] font-semibold text-ink-2">E-sports stats · CS2</Text>
          </View>
        </Pressable>
      </Link>

      <View className="gap-0.5">
        {NAV_ITEMS.map((item) => {
          const active =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} asChild>
              <Pressable
                className={`flex-row items-center gap-3 rounded-[11px] px-3 py-2.5 ${
                  active ? "bg-primary/15" : ""
                }`}
              >
                {item.icon === "counterstrike" ? (
                  <GameIcon
                    name="counterstrike"
                    size={19}
                    color={active ? accent : muted}
                  />
                ) : (
                  <Ionicons
                    name={active ? item.icon : (`${item.icon}-outline` as never)}
                    size={19}
                    color={active ? accent : muted}
                  />
                )}
                <Text
                  className={`text-[13.5px] font-bold ${active ? "text-primary" : "text-ink-2"}`}
                >
                  {item.name}
                </Text>
              </Pressable>
            </Link>
          );
        })}
      </View>

      <View className="mt-auto gap-2 border-t border-line pt-3">
        <Pressable
          onPress={toggleColorScheme}
          className="flex-row items-center justify-center gap-2 rounded-[11px] border border-line-2 px-3 py-2.5"
        >
          <Ionicons
            name={isDark ? "moon" : "sunny"}
            size={16}
            color={isDark ? "#a3a3a3" : "#6b6b6b"}
          />
          <Text className="text-xs font-bold text-ink-2">{isDark ? "Escuro" : "Claro"}</Text>
        </Pressable>
      </View>
    </View>
  );
}
