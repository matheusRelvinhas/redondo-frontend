import { useId } from "react";
import { StyleSheet } from "react-native";
import Svg, { Defs, RadialGradient, Rect, Stop } from "react-native-svg";
import { useAppContext } from "@/context/context";
import { colorsFor } from "@/lib/colors";

export function PrimaryGlow({ opacity = 0.14 }: { opacity?: number }) {
  const { theme } = useAppContext();
  const primary = colorsFor(theme).primary;

  const id = `glow-${useId().replace(/:/g, "")}`;

  return (
    <Svg
      style={StyleSheet.absoluteFill}
      pointerEvents="none"
      width="100%"
      height="100%"
    >
      <Defs>
        <RadialGradient id={id} cx="0.5" cy="0" rx="0.6" ry="0.5">
          <Stop offset="0" stopColor={primary} stopOpacity={opacity} />
          <Stop offset="0.7" stopColor={primary} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${id})`} />
    </Svg>
  );
}
