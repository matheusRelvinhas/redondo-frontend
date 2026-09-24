import { View, Text } from "react-native";

export const AD_COLUMN_WIDTH = 200;

export function AdSlot({ orientation }: { orientation: "vertical" | "horizontal" }) {
  const vertical = orientation === "vertical";

  return (
    <View
      className="items-center justify-center rounded-xl border border-dashed border-line-2"
      style={vertical ? { width: 160, height: 600 } : { width: "100%", maxWidth: 320, height: 80 }}
    >
      <Text className="text-[10px] font-bold uppercase tracking-[1px] text-ink-3">
        Anúncio
      </Text>
      <Text className="mt-1 text-[10px] text-ink-3">{vertical ? "160×600" : "320×80"}</Text>
    </View>
  );
}
