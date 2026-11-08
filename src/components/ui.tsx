import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef } from 'react';
import { Animated, Modal, Pressable, StyleProp, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';
import { buzz, play } from '../audio';
import { UI } from '../theme';

export const FONT = {
  regular: 'Baloo2_500Medium',
  bold: 'Baloo2_700Bold',
  black: 'Baloo2_800ExtraBold',
};

export function T({
  style,
  children,
  numberOfLines,
  adjustsFontSizeToFit,
  minimumFontScale,
}: {
  style?: StyleProp<TextStyle>;
  children: React.ReactNode;
  numberOfLines?: number;
  adjustsFontSizeToFit?: boolean;
  minimumFontScale?: number;
}) {
  return (
    <Text
      numberOfLines={numberOfLines}
      adjustsFontSizeToFit={adjustsFontSizeToFit}
      minimumFontScale={minimumFontScale}
      style={[{ fontFamily: FONT.bold, color: UI.plum, fontSize: 16 }, style]}
    >
      {children}
    </Text>
  );
}

/** Springy press wrapper used by every tappable element. */
export function Bouncy({
  onPress,
  children,
  style,
  disabled,
  sound = 'button',
}: {
  onPress?: () => void;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  sound?: 'button' | 'none';
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const to = (v: number) => Animated.spring(scale, { toValue: v, useNativeDriver: true, speed: 40, bounciness: 10 }).start();
  return (
    <Pressable
      style={style}
      disabled={disabled}
      onPressIn={() => to(0.92)}
      onPressOut={() => to(1)}
      onPress={() => {
        if (sound === 'button') play('button');
        buzz('light');
        onPress?.();
      }}
    >
      <Animated.View style={[{ transform: [{ scale }], width: '100%' }, disabled && { opacity: 0.5 }]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}

const BTN_COLORS = {
  coral: ['#FF9A85', '#FF6F61', '#D9493D'],
  mint: ['#8EE6C2', '#45C99A', '#2A9C73'],
  plum: ['#A985B0', '#7B5A82', '#523657'],
  gold: ['#FFE07A', '#FFC23C', '#D99A12'],
  sky: ['#9FD8FF', '#5FB4F2', '#3586C4'],
} as const;

export function YarnButton({
  label,
  onPress,
  color = 'coral',
  icon,
  style,
  small,
  disabled,
}: {
  label: string;
  onPress: () => void;
  color?: keyof typeof BTN_COLORS;
  icon?: keyof typeof Ionicons.glyphMap;
  style?: StyleProp<ViewStyle>;
  small?: boolean;
  disabled?: boolean;
}) {
  const [top, mid, edge] = BTN_COLORS[color];
  const h = small ? 48 : 58;
  return (
    <Bouncy onPress={onPress} style={style} disabled={disabled}>
      <View style={{ borderRadius: h / 2, backgroundColor: edge, paddingBottom: 5, width: '100%' }}>
        <LinearGradient
          colors={[top, mid]}
          style={[styles.btn, { height: h, borderRadius: h / 2, paddingHorizontal: small ? 14 : 28, width: '100%' }]}
        >
          <View style={styles.btnShine} />
          {icon && <Ionicons name={icon} size={small ? 19 : 26} color="#fff" style={{ marginRight: 6 }} />}
          <T
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.75}
            style={{
              color: '#fff',
              fontFamily: FONT.black,
              fontSize: small ? 16 : 24,
              flexShrink: 1,
              textShadowColor: 'rgba(0,0,0,0.18)',
              textShadowOffset: { width: 0, height: 2 },
              textShadowRadius: 1,
            }}
          >
            {label}
          </T>
        </LinearGradient>
      </View>
    </Bouncy>
  );
}

export function RoundIcon({ icon, onPress, size = 46, color = UI.plum, bg = UI.white }: { icon: keyof typeof Ionicons.glyphMap; onPress: () => void; size?: number; color?: string; bg?: string }) {
  return (
    <Bouncy onPress={onPress}>
      <View style={[styles.round, { width: size, height: size, borderRadius: size / 2, backgroundColor: bg }]}>
        <Ionicons name={icon} size={size * 0.52} color={color} />
      </View>
    </Bouncy>
  );
}

export function CoinBadge({ coins }: { coins: number }) {
  return (
    <View style={styles.coin}>
      <View style={styles.coinIcon}>
        <View style={styles.coinStripe} />
      </View>
      <T style={{ fontSize: 18, fontFamily: FONT.black, marginLeft: 6, minWidth: 34 }}>{coins}</T>
    </View>
  );
}

export function Sheet({ visible, onClose, children, title }: { visible: boolean; onClose?: () => void; children: React.ReactNode; title?: string }) {
  if (!visible) return null;
  return (
    <View style={[styles.backdrop, StyleSheet.absoluteFill, { zIndex: 9500, elevation: 9500 }]} pointerEvents="auto">
      <View style={styles.sheet}>
        <View style={styles.sheetStitch} pointerEvents="none" />
        {title && <T style={styles.sheetTitle}>{title}</T>}
        {onClose && (
          <View style={{ position: 'absolute', right: 10, top: 10, zIndex: 10 }}>
            <RoundIcon icon="close" onPress={onClose} size={38} bg={UI.peach} />
          </View>
        )}
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  btn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  btnShine: { position: 'absolute', top: 5, left: 18, right: 18, height: 12, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.35)' },
  round: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: UI.plum,
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  coin: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 22,
    paddingLeft: 5,
    paddingRight: 12,
    height: 40,
    elevation: 2,
  },
  coinIcon: { width: 28, height: 28, borderRadius: 14, backgroundColor: UI.gold, borderWidth: 3, borderColor: '#F0A81E', alignItems: 'center', justifyContent: 'center' },
  coinStripe: { width: 14, height: 4, borderRadius: 2, backgroundColor: '#F0A81E', transform: [{ rotate: '-35deg' }] },
  backdrop: { flex: 1, backgroundColor: 'rgba(60,35,62,0.55)', alignItems: 'center', justifyContent: 'center', padding: 22 },
  sheet: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: UI.cream,
    borderRadius: 30,
    paddingHorizontal: 20,
    paddingTop: 26,
    paddingBottom: 28,
    alignItems: 'center',
    borderWidth: 5,
    borderColor: UI.peach,
  },
  sheetStitch: { position: 'absolute', top: 6, left: 6, right: 6, bottom: 6, borderRadius: 24, borderWidth: 2, borderColor: '#F2B79B', borderStyle: 'dashed' },
  sheetTitle: { fontFamily: FONT.black, fontSize: 30, color: UI.plum, marginBottom: 10 },
});
