import { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, Pressable, Animated, Easing } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Logo } from "./logo";
import { useAppContext } from "@/context/context";
import { colorsFor } from "@/lib/colors";
import { formatDate, formatHour } from "@/lib/format";
import { countWords, parseAiHtml, sliceBlocks, type AiBlock } from "@/lib/ai-html";

function useTypewriter(blocks: AiBlock[], speed = 100, wordsPerTick = 10) {
  const total = useMemo(() => countWords(blocks), [blocks]);
  const [shown, setShown] = useState(0);

  useEffect(() => {
    setShown(0);
  }, [blocks]);

  useEffect(() => {
    if (shown >= total) return;
    const id = setTimeout(() => setShown((n) => Math.min(total, n + wordsPerTick)), speed);
    return () => clearTimeout(id);
  }, [shown, total, speed, wordsPerTick]);

  return { visible: sliceBlocks(blocks, shown), typing: shown < total };
}

const TONE_CLASS = {
  success: "text-success",
  danger: "text-danger",
  tr: "text-tr",
} as const;

function SpinningLogo({ size = 28 }: { size?: number }) {
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [spin]);

  return (
    <Animated.View
      style={{
        transform: [
          { rotate: spin.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] }) },
        ],
      }}
    >
      <Logo size={size} />
    </Animated.View>
  );
}

export function AiAnalysis({
  analysis,
  timestamp,
  loading,
  onGenerate,
  canGenerate,
}: {
  analysis: string | null;
  timestamp: number | null;
  loading: boolean;
  onGenerate: () => void;
  canGenerate: boolean;
}) {
  const { theme } = useAppContext();
  const c = colorsFor(theme);

  const blocks = useMemo(() => parseAiHtml(analysis ?? ""), [analysis]);
  const { visible, typing } = useTypewriter(blocks);

  if (analysis) {
    return (
      <View className="mt-1 flex-row items-start gap-2.5">
        <View className="mt-1.5">
          <Logo size={28} />
        </View>

        <View className="min-w-0 flex-1 rounded-[4px_16px_16px_16px] border border-line bg-surface px-3 pb-3 pt-2.5">
          <View className="mb-1.5 flex-row items-center justify-between gap-2">
            <View className="flex-row items-center gap-1.5">
              <Ionicons name="sparkles" size={12} color={c.primary} />
              <Text className="text-[11px] font-bold text-primary">Análise pré-jogo</Text>
            </View>
            {timestamp ? (
              <Text className="text-[11px] font-semibold text-ink-3">
                {`${formatDate(timestamp)} · ${formatHour(timestamp)}`}
              </Text>
            ) : null}
          </View>

          <View className="gap-1.5">
            {visible.map((block, i) => (
              <View
                key={i}
                className={block.type === "item" ? "flex-row gap-1.5 pl-1" : undefined}
              >
                {block.type === "item" ? (
                  <Text className="text-[12.5px] leading-[19px] text-ink-3">•</Text>
                ) : null}
                <Text className="min-w-0 flex-1 text-[12.5px] leading-[19px] text-ink-2">
                  {block.parts.map((part, j) => (
                    <Text
                      key={j}
                      className={
                        part.bold
                          ? `font-bold ${part.tone ? TONE_CLASS[part.tone] : "text-ink"}`
                          : undefined
                      }
                      style={part.italic ? { fontStyle: "italic" } : undefined}
                    >
                      {part.text}
                    </Text>
                  ))}
                  {typing && i === visible.length - 1 ? (
                    <Text className="text-primary">▌</Text>
                  ) : null}
                </Text>
              </View>
            ))}
          </View>

          {!typing ? (
            <View className="mt-2 border-t border-dashed border-line pt-2">
              <Text className="text-[10.5px] text-ink-3">
                Redondo IA considera estatísticas atuais de campeonatos do tier S e A.
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    );
  }

  if (!canGenerate) return null;

  return (
    <View className="mt-1 items-center">
      <Pressable
        onPress={onGenerate}
        disabled={loading}
        className="h-11 flex-row items-center gap-2.5 rounded-xl border border-line-2 bg-surface px-4 active:border-primary"
      >
        {loading ? <SpinningLogo size={26} /> : <Logo size={26} />}
        <Text className="text-[13px] font-bold text-ink">
          {loading ? "Pensando…" : "Análise IA"}
        </Text>
      </Pressable>
    </View>
  );
}
