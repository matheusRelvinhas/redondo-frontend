import { useEffect, type ReactNode } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  useWindowDimensions,
  Platform,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import { router, usePathname, type Href } from "expo-router";
import { LogoImage } from "./logo";
import { AdSlot, AD_COLUMN_WIDTH } from "./ad-slot";

/** Largura máxima do conteúdo da página, incluindo a coluna de anúncio. */
export const CONTAINER_WIDTH = 1100;

export const useIsDesktop = () => {
  const { width } = useWindowDimensions();
  return Platform.OS === "web" && width >= 1024;
};

const visited: string[] = [];
const HISTORY_LIMIT = 20;

function useTrackPath() {
  const pathname = usePathname();

  useEffect(() => {
    if (visited[visited.length - 1] === pathname) return;
    visited.push(pathname);
    if (visited.length > HISTORY_LIMIT) visited.shift();
  }, [pathname]);
}

/** Volta para a última página visitada; sem histórico, vai para /games. */
const goBack = () => {
  visited.pop(); // a página atual
  const previous = visited.pop();
  if (previous) router.replace(previous as Href);
  else if (router.canGoBack()) router.back();
  else router.replace("/games");
};

export function BackButton() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <Pressable
      onPress={goBack}
      className="h-9 flex-row items-center gap-1.5 self-start rounded-[11px] border border-line bg-surface px-2.5"
    >
      <Ionicons name="arrow-back" size={17} color={isDark ? "#a3a3a3" : "#6b6b6b"} />
      <Text className="text-[13px] font-bold text-ink-2">Voltar</Text>
    </Pressable>
  );
}

function AppBar({ back }: { back?: boolean }) {
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <View className="flex-row items-center justify-between gap-2.5 px-4 pb-2 pt-1.5">
      {back ? (
        <Pressable
          onPress={goBack}
          className="h-9 w-9 items-center justify-center rounded-[11px] border border-line bg-surface"
        >
          <Ionicons name="arrow-back" size={18} color={isDark ? "#a3a3a3" : "#6b6b6b"} />
        </Pressable>
      ) : (
        <View className="flex-row items-center gap-2.5">
          <LogoImage size={30} />
          <View>
            <Text className="font-display text-sm font-bold tracking-[1.2px] text-ink">REDONDO STATS</Text>
            <Text className="mt-0.5 text-[10px] font-semibold text-ink-2">E-sports stats · CS2</Text>
          </View>
        </View>
      )}

      <Pressable
        onPress={toggleColorScheme}
        className="h-9 w-9 items-center justify-center rounded-[11px] border border-line bg-surface"
      >
        <Ionicons name={isDark ? "moon" : "sunny"} size={17} color={isDark ? "#a3a3a3" : "#6b6b6b"} />
      </Pressable>
    </View>
  );
}

export function Screen({
  children,
  back,
  onEndReached,
}: {
  children: ReactNode;
  back?: boolean;
  onEndReached?: () => void;
}) {
  const isDesktop = useIsDesktop();
  const insets = useSafeAreaInsets();

  useTrackPath();

  const handleScroll = onEndReached
    ? ({ nativeEvent }: NativeSyntheticEvent<NativeScrollEvent>) => {
        const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
        const distanceToEnd =
          contentSize.height - (contentOffset.y + layoutMeasurement.height);
        if (distanceToEnd < 400) onEndReached();
      }
    : undefined;

  return (
    <View className="flex-1 bg-bg" style={{ paddingTop: isDesktop ? 0 : insets.top }}>
      {isDesktop ? null : <AppBar back={back} />}

      <ScrollView onScroll={handleScroll} scrollEventThrottle={200}>
        <View className="w-full flex-row justify-center">
          <View className="w-full flex-row" style={{ maxWidth: CONTAINER_WIDTH }}>
            <View
              className="min-w-0 flex-1 gap-3.5 px-4 pb-4"
              style={{ paddingTop: isDesktop ? 24 : 4 }}
            >
              {isDesktop ? null : (
                <View className="items-center pt-1">
                  <AdSlot orientation="horizontal" />
                </View>
              )}

              {back && isDesktop ? <BackButton /> : null}
              {children}

              {isDesktop ? null : (
                <View className="items-center">
                  <AdSlot orientation="horizontal" />
                </View>
              )}
            </View>

            {isDesktop ? (
              <View
                className="items-center px-3"
                style={{
                  width: AD_COLUMN_WIDTH,
                  paddingTop: 24,
                  alignSelf: "flex-start",
                  position: "sticky",
                  top: 24,
                } as ViewStyle}
              >
                <AdSlot orientation="vertical" />
              </View>
            ) : null}
          </View>
        </View>
      </ScrollView>

    </View>
  );
}

export function PageTitle({ title, subtitle, right }: { title: string; subtitle?: string; right?: ReactNode }) {
  return (
    <View className="flex-row items-center justify-between gap-3">
      <View className="min-w-0 flex-1">
        <Text className="text-xl font-extrabold text-ink">{title}</Text>
        {subtitle ? <Text className="mt-0.5 text-xs text-ink-2">{subtitle}</Text> : null}
      </View>
      {right}
    </View>
  );
}
