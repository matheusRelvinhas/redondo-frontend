export interface ThemeColors {
  primary: string;
  primaryInk: string;
  success: string;
  danger: string;
  live: string;
  ct: string;
  tr: string;
  bg: string;
  surface: string;
  surface2: string;
  surface3: string;
  border: string;
  border2: string;
  ink: string;
  ink2: string;
  ink3: string;
}

export const COLORS: Record<"dark" | "light", ThemeColors> = {
  dark: {
    primary: "#ff9c6e",
    primaryInk: "#1a1a1a",
    success: "#95de64",
    danger: "#ff7875",
    live: "#ff4d4f",
    ct: "#85a5ff",
    tr: "#ffd666",
    bg: "#0f0f10",
    surface: "#171718",
    surface2: "#1f1f21",
    surface3: "#27272a",
    border: "#27272a",
    border2: "#333336",
    ink: "#f2f2f0",
    ink2: "#a3a3a3",
    ink3: "#6f6f73",
  },
  light: {
    primary: "#fc6746",
    primaryInk: "#ffffff",
    success: "#389e0d",
    danger: "#e5232d",
    live: "#e5232d",
    ct: "#3b62e6",
    tr: "#e07a00",
    bg: "#f6f6f4",
    surface: "#ffffff",
    surface2: "#f1f1ef",
    surface3: "#e9e9e6",
    border: "#e6e6e3",
    border2: "#d9d9d5",
    ink: "#1a1a1a",
    ink2: "#6b6b6b",
    ink3: "#9a9a9a",
  },
};

export type ThemeName = keyof typeof COLORS;

export const colorsFor = (theme: ThemeName): ThemeColors => COLORS[theme];
