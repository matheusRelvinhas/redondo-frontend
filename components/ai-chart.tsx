import { useMemo, useState } from "react";
import { View, Text, Pressable, useWindowDimensions } from "react-native";
import Svg, { Path, Line, Circle, G, Text as SvgText } from "react-native-svg";
import { useAppContext } from "@/context/context";
import { colorsFor } from "@/lib/colors";
import type { AiPerformance } from "@/lib/types";

const MONTHS_SHORT = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

const SCREEN_MAX_WIDTH = 1100;
const SCREEN_PADDING = 32;
const PANEL_PADDING = 24;
const SIDEBAR_WIDTH = 232;
const AD_COLUMN = 200;

type Point = { t: number; win: number; exact: number; n: number };

function buildPoints(games: AiPerformance[]): Point[] {
  const sorted = [...games].sort((a, b) => a.start_timestamp - b.start_timestamp);
  let win = 0;
  let exact = 0;
  return sorted.map((g, i) => {
    if (g.win_result) win += 1;
    if (g.exact_result) exact += 1;
    return { t: g.start_timestamp, win, exact, n: i + 1 };
  });
}

function smoothPath(pts: { x: number; y: number }[], tension = 0.35) {
  if (pts.length < 2) return "";
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1x = p1.x + ((p2.x - p0.x) / 6) * tension * 2;
    const c1y = p1.y + ((p2.y - p0.y) / 6) * tension * 2;
    const c2x = p2.x - ((p3.x - p1.x) / 6) * tension * 2;
    const c2y = p2.y - ((p3.y - p1.y) / 6) * tension * 2;
    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

export function AiChart({ games, loading }: { games: AiPerformance[]; loading?: boolean }) {
  const { theme, isDesktop } = useAppContext();
  const c = colorsFor(theme);

  const { width: windowWidth } = useWindowDimensions();
  const [measured, setMeasured] = useState(0);

  const container = Math.min(SCREEN_MAX_WIDTH, windowWidth - (isDesktop ? SIDEBAR_WIDTH : 0));
  const available = container - (isDesktop ? AD_COLUMN : 0);
  const fallbackWidth = available - SCREEN_PADDING - PANEL_PADDING;
  const width = Math.max(240, measured || fallbackWidth);

  const [active, setActive] = useState<Point | null>(null);

  const height = isDesktop ? 260 : 190;
  const padLeft = 34;
  const padRight = 12;
  const padTop = 14;
  const padBottom = 24;

  const points = useMemo(() => buildPoints(games), [games]);

  const chart = useMemo(() => {
    if (!points.length || width <= 0) return null;

    const total = points.length;
    const x0 = points[0].t;
    const x1 = points[total - 1].t;
    const span = Math.max(1, x1 - x0);

    const X = (t: number) => padLeft + ((t - x0) / span) * (width - padLeft - padRight);
    const Y = (v: number) => padTop + (1 - v / total) * (height - padTop - padBottom);

    const step = Math.max(1, Math.ceil(total / 120));
    const sampled = points.filter((_, i) => i % step === 0 || i === total - 1);

    const winPts = sampled.map((p) => ({ x: X(p.t), y: Y(p.win) }));
    const exactPts = sampled.map((p) => ({ x: X(p.t), y: Y(p.exact) }));
    const baseline = Y(0);

    const area = (pts: { x: number; y: number }[]) =>
      `${smoothPath(pts)} L ${pts[pts.length - 1].x} ${baseline} L ${pts[0].x} ${baseline} Z`;

    const stepY = total > 800 ? 200 : total > 400 ? 100 : 50;
    const yTicks: number[] = [];
    for (let v = 0; v <= total; v += stepY) yTicks.push(v);

    const xTicks: { t: number; label: string }[] = [];
    const start = new Date(x0 * 1000);
    const cursor = new Date(start.getFullYear(), start.getMonth() + 1, 1);
    while (cursor.getTime() / 1000 <= x1) {
      xTicks.push({
        t: cursor.getTime() / 1000,
        label:
          cursor.getMonth() === 0
            ? `${MONTHS_SHORT[0]} ${String(cursor.getFullYear()).slice(2)}`
            : MONTHS_SHORT[cursor.getMonth()],
      });
      cursor.setMonth(cursor.getMonth() + 1);
    }
    const everyOther = isDesktop ? 1 : 2;

    return {
      total,
      X,
      Y,
      baseline,
      winPath: smoothPath(winPts),
      exactPath: smoothPath(exactPts),
      winArea: area(winPts),
      exactArea: area(exactPts),
      yTicks,
      xTicks: xTicks.filter((_, i) => i % everyOther === 0),
      last: points[total - 1],
    };
  }, [points, width, height, isDesktop]);

  const handleTouch = (locationX: number) => {
    if (!chart || !points.length) return;
    const ratio = (locationX - padLeft) / (width - padLeft - padRight);
    const index = Math.round(ratio * (points.length - 1));
    setActive(points[Math.min(points.length - 1, Math.max(0, index))]);
  };

  if (loading) {
    return (
      <View style={{ height }} className="items-center justify-center">
        <Text className="text-xs text-ink-3">Carregando…</Text>
      </View>
    );
  }

  if (!points.length) {
    return (
      <View style={{ height }} className="items-center justify-center">
        <Text className="text-xs text-ink-3">Nenhum dado disponível</Text>
      </View>
    );
  }

  return (
    <View
      className="w-full overflow-hidden"
      onLayout={(e) => setMeasured(e.nativeEvent.layout.width)}
    >
      <Pressable
        onPressIn={(e) => handleTouch(e.nativeEvent.locationX)}
        onTouchMove={(e) => handleTouch(e.nativeEvent.locationX)}
        onPressOut={() => setActive(null)}
        style={{ height }}
      >
        {chart ? (
          <Svg width={width} height={height}>
            <G>
              {chart.yTicks.map((v) => (
                <G key={v}>
                  <Line
                    x1={padLeft}
                    x2={width - padRight}
                    y1={chart.Y(v)}
                    y2={chart.Y(v)}
                    stroke={c.border}
                    strokeWidth={1}
                  />
                  <SvgText
                    x={padLeft - 6}
                    y={chart.Y(v) + 3}
                    fill={c.ink3}
                    fontSize={9}
                    textAnchor="end"
                  >
                    {String(v)}
                  </SvgText>
                </G>
              ))}
            </G>

            {chart.xTicks.map((tick) => (
              <SvgText
                key={tick.t}
                x={chart.X(tick.t)}
                y={height - 8}
                fill={c.ink3}
                fontSize={9}
                textAnchor="middle"
              >
                {tick.label}
              </SvgText>
            ))}

            <Path d={chart.winArea} fill={c.primary} opacity={0.1} />
            <Path d={chart.exactArea} fill={c.success} opacity={0.08} />
            <Path d={chart.winPath} stroke={c.primary} strokeWidth={2} fill="none" />
            <Path
              d={chart.exactPath}
              stroke={c.success}
              strokeWidth={2}
              fill="none"
              strokeDasharray="5,4"
            />

            {(() => {
              const p = active ?? chart.last;
              return (
                <G>
                  {active ? (
                    <Line
                      x1={chart.X(p.t)}
                      x2={chart.X(p.t)}
                      y1={padTop}
                      y2={height - padBottom}
                      stroke={c.ink3}
                      strokeWidth={1}
                      strokeDasharray="3,3"
                    />
                  ) : null}
                  <Circle
                    cx={chart.X(p.t)}
                    cy={chart.Y(p.win)}
                    r={4}
                    fill={c.primary}
                    stroke={c.surface}
                    strokeWidth={2}
                  />
                  <Circle
                    cx={chart.X(p.t)}
                    cy={chart.Y(p.exact)}
                    r={4}
                    fill={c.success}
                    stroke={c.surface}
                    strokeWidth={2}
                  />
                </G>
              );
            })()}
          </Svg>
        ) : null}
      </Pressable>

      <View className="mt-1 flex-row flex-wrap items-center justify-between gap-2 px-1">
        <View className="flex-row flex-wrap gap-3.5">
          <View className="flex-row items-center gap-1.5">
            <View className="h-0.5 w-3.5 rounded-sm" style={{ backgroundColor: c.primary }} />
            <Text className="text-[11px] font-semibold text-ink-2">Vencedor certo</Text>
            <Text className="text-[11px] font-bold text-ink">
              {(active ?? chart?.last)?.win ?? 0}
            </Text>
          </View>
          <View className="flex-row items-center gap-1.5">
            <View className="h-0.5 w-3.5 rounded-sm" style={{ backgroundColor: c.success }} />
            <Text className="text-[11px] font-semibold text-ink-2">Placar exato</Text>
            <Text className="text-[11px] font-bold text-ink">
              {(active ?? chart?.last)?.exact ?? 0}
            </Text>
          </View>
        </View>
        <Text className="text-[10.5px] text-ink-3">
          {active
            ? `${active.n} partidas até ${new Date(active.t * 1000).toLocaleDateString("pt-BR")}`
            : `${points.length} partidas`}
        </Text>
      </View>
    </View>
  );
}
