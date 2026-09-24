import { View } from "react-native";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAppContext } from "@/context/context";
import { GameIcon } from "@/components/game-icons";
import { colorsFor } from "@/lib/colors";
import { Sidebar } from "@/components/sidebar";

export default function TabsLayout() {
  const { theme, isDesktop } = useAppContext();
  const c = colorsFor(theme);

  const tabs = (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: c.primary,
        tabBarInactiveTintColor: c.ink3,
        tabBarLabelStyle: { fontSize: 10, fontWeight: "700" },
        tabBarItemStyle: { paddingHorizontal: 0 },
        tabBarStyle: isDesktop
          ? { display: "none" }
          : { backgroundColor: c.surface, borderTopColor: c.border, height: 62, paddingTop: 6 },
        sceneStyle: { backgroundColor: "transparent" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Início",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "home" : "home-outline"} size={21} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="games"
        options={{
          title: "Jogos",
          tabBarIcon: ({ color }) => (
            <GameIcon name="counterstrike" size={20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="leagues"
        options={{
          title: "Ligas",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "trophy" : "trophy-outline"} size={21} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="teams"
        options={{
          title: "Times",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "people" : "people-outline"} size={21} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="players"
        options={{
          title: "Jogadores",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "person" : "person-outline"} size={21} color={color} />
          ),
        }}
      />
      <Tabs.Screen name="game/[slug]" options={{ href: null }} />
    </Tabs>
  );

  if (!isDesktop) return <View className="flex-1 bg-bg">{tabs}</View>;

  return (
    <View className="flex-1 flex-row bg-bg">
      <Sidebar />
      <View className="flex-1">{tabs}</View>
    </View>
  );
}
