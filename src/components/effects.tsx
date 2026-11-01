import React, { useEffect, useRef } from 'react';
import { Animated, Easing, View } from 'react-native';
import { YARN } from '../theme';

/** A tiny yarn ball flying from a stitch to its spool along an arc. */
export function Flyer({ x0, y0, x1, y1, color, size, onDone }: { x0: number; y0: number; x1: number; y1: number; color: string; size: number; onDone: () => void }) {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(t, { toValue: 1, duration: 340, easing: Easing.inOut(Easing.quad), useNativeDriver: true }).start(onDone);
  }, []);
  const peak = Math.min(y0, y1) - 40;
  const tx = t.interpolate({ inputRange: [0, 1], outputRange: [x0 - size / 2, x1 - size / 2] });
  const ty = t.interpolate({ inputRange: [0, 0.4, 1], outputRange: [y0 - size / 2, (y0 + peak) / 2, y1 - size / 2] });
  const sc = t.interpolate({ inputRange: [0, 0.3, 1], outputRange: [1, 1.25, 0.5] });
  const c = YARN[color];
  return (
    <Animated.View pointerEvents="none" style={{ position: 'absolute', left: 0, top: 0, transform: [{ translateX: tx }, { translateY: ty }, { scale: sc }] }}>
      <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: c.base, borderWidth: 2, borderColor: c.light, overflow: 'hidden' }}>
        <View style={{ position: 'absolute', left: size * 0.15, top: size * 0.3, width: size * 0.7, height: 2, backgroundColor: c.dark, transform: [{ rotate: '-30deg' }] }} />
        <View style={{ position: 'absolute', left: size * 0.15, top: size * 0.6, width: size * 0.7, height: 2, backgroundColor: c.dark, transform: [{ rotate: '-30deg' }] }} />
      </View>
    </Animated.View>
  );
}

/** Burst of yarn fluff when a spool completes. */
export function PopBurst({ x, y, color, onDone }: { x: number; y: number; color: string; onDone: () => void }) {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(t, { toValue: 1, duration: 520, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start(onDone);
  }, []);
  const c = YARN[color];
  const ringScale = t.interpolate({ inputRange: [0, 1], outputRange: [0.3, 2.2] });
  const fade = t.interpolate({ inputRange: [0, 0.7, 1], outputRange: [1, 0.6, 0] });
  const N = 10;
  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: x, top: y }}>
      <Animated.View
        style={{ position: 'absolute', left: -30, top: -30, width: 60, height: 60, borderRadius: 30, borderWidth: 5, borderColor: c.light, opacity: fade, transform: [{ scale: ringScale }] }}
      />
      {Array.from({ length: N }).map((_, i) => {
        const a = (i / N) * Math.PI * 2;
        const d = 46 + (i % 3) * 10;
        const tx = t.interpolate({ inputRange: [0, 1], outputRange: [0, Math.cos(a) * d] });
        const ty = t.interpolate({ inputRange: [0, 1], outputRange: [0, Math.sin(a) * d] });
        const s = 8 + (i % 3) * 3;
        return (
          <Animated.View
            key={i}
            style={{
              position: 'absolute',
              left: -s / 2,
              top: -s / 2,
              width: s,
              height: s,
              borderRadius: s / 2,
              backgroundColor: i % 2 ? c.base : i % 3 ? '#FFFFFF' : c.light,
              opacity: fade,
              transform: [{ translateX: tx }, { translateY: ty }],
            }}
          />
        );
      })}
    </View>
  );
}

/** Spring-in wrapper for spools landing on the rack. */
export function PopIn({ children }: { children: React.ReactNode }) {
  const s = useRef(new Animated.Value(0.3)).current;
  useEffect(() => {
    Animated.spring(s, { toValue: 1, useNativeDriver: true, speed: 18, bounciness: 14 }).start();
  }, []);
  return <Animated.View style={{ transform: [{ scale: s }] }}>{children}</Animated.View>;
}

/** Horizontal shake used when a tap is not allowed. */
export function useShake() {
  const v = useRef(new Animated.Value(0)).current;
  const shake = () => {
    v.setValue(0);
    Animated.sequence([
      Animated.timing(v, { toValue: 1, duration: 50, useNativeDriver: true }),
      Animated.timing(v, { toValue: -1, duration: 50, useNativeDriver: true }),
      Animated.timing(v, { toValue: 1, duration: 50, useNativeDriver: true }),
      Animated.timing(v, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };
  const style = { transform: [{ translateX: v.interpolate({ inputRange: [-1, 1], outputRange: [-8, 8] }) }] };
  return { shake, style };
}
