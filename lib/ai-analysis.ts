import { useCallback, useEffect, useRef, useState } from "react";
import { axiosGet } from "./api";


const POLL_INTERVAL = 5000;

export function useAiAnalysis(slug?: string, gameStatus?: string | null) {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [timestamp, setTimestamp] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const requestId = useRef(0);

  useEffect(() => {
    requestId.current += 1;
    setAnalysis(null);
    setTimestamp(null);
    setLoading(false);

    return () => {
      requestId.current += 1;
    };
  }, [slug]);

  const fetchAnalysis = useCallback(
    async (onlyExisting: boolean) => {
      if (!slug) return;

      const id = (requestId.current += 1);
      const isCurrent = () => requestId.current === id;

      setLoading(true);
      let done = false;

      while (!done && isCurrent()) {
        await axiosGet(
          `/ai_analytics/game?slug=${slug}${onlyExisting ? "&not_ai_return=ok" : ""}`,
          (data) => {
            if (!isCurrent()) return;

            if (data?.not_ai_return) {
              done = true;
              return;
            }

            setAnalysis(data?.ai_analytics_game ?? null);
            setTimestamp(data?.timestamp ?? null);
            if (data?.status === "success") done = true;
          },
          () => {
            done = true;
          },
          true
        );

        if (!done && isCurrent()) {
          await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL));
        }
      }

      if (isCurrent()) setLoading(false);
    },
    [slug]
  );

  useEffect(() => {
    if (!slug || !gameStatus) return;
    fetchAnalysis(true);
  }, [slug, gameStatus, fetchAnalysis]);

  return {
    analysis,
    timestamp,
    loading,
    generate: () => fetchAnalysis(false),
  };
}
