import { useRef, useState } from "react";
import { View, Animated, Platform, type ImageStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppContext } from "@/context/context";
import { resolveBaseUrl } from "@/lib/api";


const IMAGES_URL = resolveBaseUrl(
  (
    process.env.EXPO_PUBLIC_IMAGES_URL ??
    process.env.EXPO_PUBLIC_BACKEND_URL ??
    ""
  ).replace(/\/$/, "")
);

export const imagePath = (path: string) => `${IMAGES_URL}/img/${path}`;

type Kind = "teams" | "players" | "leagues";

const FALLBACK_ICON: Record<Kind, keyof typeof Ionicons.glyphMap> = {
  teams: "shield-outline",
  players: "person-circle-outline",
  leagues: "trophy-outline",
};

interface EntityImageProps {
  kind: Kind;
  imgUrl?: string | null;
  size?: number;
  /** Contorno claro atrás do logo, como o drop-shadow do project-x. */
  outlined?: boolean;
  style?: ImageStyle;
}

export function EntityImage({
  kind,
  imgUrl,
  size = 22,
  outlined = true,
  style,
}: EntityImageProps) {
  const [failed, setFailed] = useState(false);
  const { theme } = useAppContext();

  // fadeIn ao carregar, como o `fadeIn` do project-x
  const opacity = useRef(new Animated.Value(0)).current;
  const fadeIn = () =>
    Animated.timing(opacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

  const box = { width: size, height: size };

  if (!imgUrl || failed) {
    return (
      <View className="items-center justify-center" style={box}>
        <Ionicons
          name={FALLBACK_ICON[kind]}
          size={size * 0.85}
          color={theme === "dark" ? "#6f6f73" : "#9a9a9a"}
        />
      </View>
    );
  }

  return (
    <Animated.Image
      source={{ uri: imagePath(`imgs/${kind}/${imgUrl}`) }}
      onLoad={fadeIn}
      onError={() => setFailed(true)}
      resizeMode="contain"
      style={[
        box,
        { opacity },
        outlined && Platform.OS === "web"
          ? ({ filter: "drop-shadow(0 0 1px rgba(0,0,0,.55))" } as ImageStyle)
          : null,
        style,
      ]}
    />
  );
}

export const TeamImage = (p: Omit<EntityImageProps, "kind">) => (
  <EntityImage kind="teams" {...p} />
);
export const PlayerImage = (p: Omit<EntityImageProps, "kind">) => (
  <EntityImage kind="players" {...p} />
);
export const LeagueImage = (p: Omit<EntityImageProps, "kind">) => (
  <EntityImage kind="leagues" {...p} />
);

/**
 * Imagem de mapa. `thumb` aponta para a versão de 64px usada nos chips do
 * card (14px na tela) — a versão cheia pesa ~90KB e só faz sentido no tile.
 */
export const mapImage = (mapName: string, size: "full" | "thumb" = "full") => ({
  uri: imagePath(size === "thumb" ? `maps/thumb/${mapName}.webp` : `maps/${mapName}.webp`),
});
