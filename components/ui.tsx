import { View, Text, Pressable, type ViewProps } from "react-native";
import type { ReactNode } from "react";


export function Panel({ className = "", children, ...rest }: ViewProps & { className?: string }) {
  return (
    <View className={`rounded-card border border-line bg-surface ${className}`} {...rest}>
      {children}
    </View>
  );
}

export function PanelHeader({ title, right }: { title: ReactNode; right?: ReactNode }) {
  return (
    <View className="flex-row items-center justify-between gap-2 px-4 pt-3">
      <View className="flex-row items-center gap-2">
        {typeof title === "string" ? (
          <Text className="text-[13px] font-extrabold text-ink">{title}</Text>
        ) : (
          title
        )}
      </View>
      {right}
    </View>
  );
}


type ChipTone = "default" | "primary" | "success" | "danger" | "outline";

const CHIP_TONES: Record<ChipTone, { box: string; text: string }> = {
  default: { box: "bg-surface-2", text: "text-ink-2" },
  primary: { box: "bg-primary/15", text: "text-primary" },
  success: { box: "bg-success/15", text: "text-success" },
  danger: { box: "bg-danger/15", text: "text-danger" },
  outline: { box: "border border-line-2", text: "text-ink-2" },
};

export function Chip({
  label,
  tone = "default",
  icon,
  className = "",
}: {
  label: string;
  tone?: ChipTone;
  icon?: ReactNode;
  className?: string;
}) {
  const t = CHIP_TONES[tone];
  return (
    <View className={`h-[22px] flex-row items-center gap-1.5 rounded-[7px] px-2 ${t.box} ${className}`}>
      {icon}
      <Text className={`text-[11px] font-bold ${t.text}`}>{label}</Text>
    </View>
  );
}


export function Score({ value, won }: { value: number | string; won?: boolean }) {
  return (
    <View
      className={`h-[22px] min-w-[28px] items-center justify-center rounded-[7px] px-1.5 ${
        won ? "bg-surface-3" : "bg-surface-2"
      }`}
    >
      <Text className={`font-display text-[15px] font-bold ${won ? "text-ink" : "text-ink-2"}`}>
        {value}
      </Text>
    </View>
  );
}


export function Segmented<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { label: string; value: T }[];
  onChange: (value: T) => void;
}) {
  return (
    <View className="flex-row self-start rounded-[11px] border border-line bg-surface-2 p-[3px]">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            className={`rounded-lg px-3.5 py-1.5 ${active ? "bg-primary" : ""}`}
          >
            <Text
              className={`text-[12.5px] font-bold ${active ? "text-primary-ink" : "text-ink-2"}`}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}


export function Eyebrow({ children }: { children: string }) {
  return (
    <Text className="text-[10.5px] font-extrabold uppercase tracking-[1px] text-ink-3">
      {children}
    </Text>
  );
}


export function TeamBadge({
  name,
  slug,
  lost,
  align = "left",
}: {
  name: string;
  slug: string;
  lost?: boolean;
  align?: "left" | "right";
}) {
  return (
    <View
      className={`min-w-0 flex-1 flex-row items-center gap-2 ${
        align === "right" ? "flex-row-reverse" : ""
      }`}
    >
      <View className="h-[22px] w-[22px] items-center justify-center rounded-md bg-surface-3">
        <Text className="text-[9px] font-extrabold text-ink-2">
          {slug.slice(0, 2).toUpperCase()}
        </Text>
      </View>
      <Text
        numberOfLines={1}
        className={`min-w-0 flex-1 font-bold ${lost ? "text-ink-2" : "text-ink"} ${
          align === "right" ? "text-right" : ""
        }`}
      >
        {name}
      </Text>
    </View>
  );
}


export function StatTile({
  label,
  value,
  suffix,
  detail,
  percent,
  color,
}: {
  label: string;
  value: string;
  suffix?: string;
  detail: string;
  percent: number;
  color: "primary" | "success";
}) {
  const dot = color === "primary" ? "bg-primary" : "bg-success";
  const bar = color === "primary" ? "bg-primary" : "bg-success";
  return (
    <Panel className="flex-1 gap-1 p-3.5">
      <View className="flex-row items-center gap-1.5">
        <View className={`h-2 w-2 rounded-full ${dot}`} />
        <Text className="text-[11px] font-bold text-ink-2">{label}</Text>
      </View>
      <View className="flex-row items-baseline">
        <Text className="font-display text-[26px] font-bold text-ink">{value}</Text>
        {suffix ? <Text className="ml-1 text-xs font-bold text-ink-2">{suffix}</Text> : null}
      </View>
      <Text className="text-[11px] text-ink-3">{detail}</Text>
      <View className="mt-1.5 h-1 overflow-hidden rounded-sm bg-surface-3">
        <View className={`h-full rounded-sm ${bar}`} style={{ width: `${percent}%` }} />
      </View>
    </Panel>
  );
}
