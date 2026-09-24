import { useId } from "react";
import { Image } from "react-native";
import Svg, { Circle, Ellipse, Mask, Rect, Defs } from "react-native-svg";
import { useAppContext } from "@/context/context";
import { colorsFor } from "@/lib/colors";

const LOGO_DARK = require("@/assets/logo-dark.png");
const LOGO_LIGHT = require("@/assets/logo-light.png");

export function LogoImage({ size = 32 }: { size?: number }) {
  const { theme } = useAppContext();

  return (
    <Image
      source={theme === "dark" ? LOGO_DARK : LOGO_LIGHT}
      style={{ width: size, height: size, flexShrink: 0 }}
      resizeMode="contain"
    />
  );
}

export function Logo({ size = 32, color }: { size?: number; color?: string }) {
  const { theme } = useAppContext();
  const fill = color ?? colorsFor(theme).primary;

  const maskId = `logo-eyes-${useId().replace(/:/g, "")}`;

  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <Mask id={maskId}>
          <Rect x="0" y="0" width="100" height="100" fill="#fff" />
          <Ellipse
            cx="27.7"
            cy="49.1"
            rx="12.96"
            ry="7.63"
            fill="#000"
            transform="rotate(40.9 27.7 49.1)"
          />
          <Ellipse
            cx="72.3"
            cy="49.1"
            rx="12.96"
            ry="7.63"
            fill="#000"
            transform="rotate(-40.9 72.3 49.1)"
          />
        </Mask>
      </Defs>
      <Circle cx="50" cy="50" r="50" fill={fill} mask={`url(#${maskId})`} />
    </Svg>
  );
}
