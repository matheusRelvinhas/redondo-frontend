import type { ReactNode } from "react";
import { View, Text, Pressable, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppContext } from "@/context/context";

export function Sheet({
  open,
  onClose,
  title,
  icon = "options-outline",
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  icon?: keyof typeof Ionicons.glyphMap;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const { theme, isDesktop } = useAppContext();
  const iconColor = theme === "dark" ? "#a3a3a3" : "#6b6b6b";

  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        onPress={onClose}
        className={`flex-1 bg-black/60 ${isDesktop ? "items-center justify-center p-6" : "justify-end"}`}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          className={`w-full gap-3.5 bg-surface px-4 pb-6 pt-2 ${
            isDesktop ? "max-w-md rounded-2xl border border-line p-5" : "rounded-t-[22px]"
          }`}
        >
          {isDesktop ? null : <View className="mx-auto h-1 w-10 rounded-sm bg-line-2" />}

          <View className="flex-row items-center justify-between gap-2">
            <View className="flex-row items-center gap-2">
              <Ionicons name={icon} size={18} color={iconColor} />
              <Text className="text-base font-extrabold text-ink">{title}</Text>
            </View>
            <Pressable
              onPress={onClose}
              hitSlop={8}
              className="h-8 w-8 items-center justify-center rounded-[10px] border border-line"
            >
              <Ionicons name="close" size={16} color={iconColor} />
            </Pressable>
          </View>

          <View className="gap-3.5">{children}</View>

          {footer}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View className="gap-1.5">
      <Text className="text-[11.5px] font-bold text-ink-2">{label}</Text>
      {children}
    </View>
  );
}
