import { useEffect, useRef } from "react";
import { View, Animated, Easing, AccessibilityInfo, Platform } from "react-native";
import { useAppContext } from "@/context/context";
import { colorsFor } from "@/lib/colors";

export function LiveDot({ size = 8 }: { size?: number }) {
  const { theme } = useAppContext();
  const live = colorsFor(theme).live;
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let loop: Animated.CompositeAnimation | null = null;

    const start = () => {
      loop = Animated.loop(
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1600,
          easing: Easing.out(Easing.ease),
          useNativeDriver: Platform.OS !== "web",
        })
      );
      loop.start();
    };

    AccessibilityInfo.isReduceMotionEnabled()
      .then((reduced) => {
        if (!reduced) start();
      })
      .catch(start);

    return () => loop?.stop();
  }, [pulse]);

  const ring = size + 6;

  return (
    <View style={{ width: size, height: size }}>
      <Animated.View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: -3,
          left: -3,
          width: ring,
          height: ring,
          borderRadius: ring / 2,
          borderWidth: 2,
          borderColor: live,
          opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.7, 0] }),
          transform: [
            { scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1.5] }) },
          ],
        }}
      />
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: live,
        }}
      />
    </View>
  );
}
