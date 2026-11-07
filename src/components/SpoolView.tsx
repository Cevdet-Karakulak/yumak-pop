import React, { memo } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useSave } from '../save';
import { COLOR_SYMBOL, YARN } from '../theme';

interface Props {
  color: string;
  cap: number;
  need: number;
  hidden?: boolean;
  knots?: number;
  twinId?: number;
  isTwinTop?: boolean;
  size: number;
  dim?: boolean;
  showCount?: boolean;
  isUnraveling?: boolean;
  isWild?: boolean;
  frozen?: number;
  isMystery?: boolean;
  secondColor?: string;
}

const TWIN_BADGE_COLORS = ['#FF7A6B', '#45C99A', '#5FB4F2', '#9B6BD3', '#F5994A'];

const SPOOL_MYSTERY = require('../../assets/sprites/spool_mystery.png');

const SPOOL_SPRITES: Record<string, number> = {
  R: require('../../assets/sprites/spool_R.png'),
  O: require('../../assets/sprites/spool_O.png'),
  Y: require('../../assets/sprites/spool_Y.png'),
  G: require('../../assets/sprites/spool_G.png'),
  T: require('../../assets/sprites/spool_T.png'),
  B: require('../../assets/sprites/spool_B.png'),
  P: require('../../assets/sprites/spool_P.png'),
  K: require('../../assets/sprites/spool_K.png'),
};

/**
 * Photorealistic Turned Dark Walnut Wood Spool:
 * - Supports:
 *   - Rainbow Joker Makara (🌈 isWild: absorbs any yarn color)
 *   - Buzlu Makara (❄️ frozen: blocks tap until thawed by rack pops)
 *   - Gizemli Makara (❓ isMystery: concealed color until reaching rack)
 *   - Çift Katmanlı Makara (🪢 secondColor: 2-in-1 combo yarn)
 */
function SpoolImpl({
  color,
  need,
  hidden,
  knots = 0,
  twinId,
  size,
  dim,
  showCount = true,
  isUnraveling = false,
  isWild = false,
  frozen = 0,
  isMystery = false,
  secondColor,
}: Props) {
  const w = size;
  const h = size * 1.12;
  const { data } = useSave();
  const colorBlind = !!data.colorBlind;

  const isConcealed = isMystery || hidden;
  const spriteSource = isConcealed ? SPOOL_MYSTERY : (SPOOL_SPRITES[color] ?? SPOOL_SPRITES.R);
  const twinColor = twinId ? TWIN_BADGE_COLORS[(twinId - 1) % TWIN_BADGE_COLORS.length] : null;

  return (
    <View
      style={[
        styles.root,
        {
          width: w,
          height: h,
          opacity: dim ? 0.72 : 1,
          transform: [{ scale: isUnraveling ? 1.14 : 1 }],
        },
      ]}
    >
      {/* 1. Recessed circular carved wooden tray socket underneath */}
      <View
        style={[
          styles.socketSaucer,
          {
            width: w * 0.96,
            height: w * 0.38,
            bottom: -2,
            borderRadius: w * 0.19,
          },
        ]}
      />

      {/* 2. Photorealistic 3D Turned Walnut Spool Image */}
      <Image
        source={spriteSource}
        style={{ width: w, height: h }}
        resizeMode="contain"
      />

      {/* Rainbow Wild Spool Outer Shimmer Aura */}
      {isWild && (
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              borderWidth: 2,
              borderColor: '#FFD700',
              borderRadius: 10,
              backgroundColor: 'rgba(255, 215, 0, 0.18)',
            },
          ]}
        />
      )}

      {/* 3. Glossy Ivory & Gold Stitch Counter Badge (Centered over yarn) */}
      {showCount && !isConcealed && (
        <View
          style={[
            styles.badge,
            isWild && styles.wildBadgeContainer,
            {
              width: w * 0.44,
              height: w * 0.44,
              borderRadius: w * 0.22,
              top: h * 0.42 - (w * 0.22),
            },
          ]}
        >
          <Text style={[styles.badgeText, isWild && styles.wildBadgeText, { fontSize: Math.max(12, w * 0.26) }]}>
            {isWild ? '★' : need}
          </Text>
        </View>
      )}

      {/* 4. Mystery / Hidden Spool Overlay */}
      {isConcealed && (
        <View
          style={[
            styles.hiddenBadge,
            {
              width: w * 0.50,
              height: w * 0.50,
              borderRadius: w * 0.25,
              top: h * 0.42 - (w * 0.25),
            },
          ]}
        >
          <Text style={[styles.hiddenText, { fontSize: Math.max(15, w * 0.30) }]}>
            ?
          </Text>
        </View>
      )}

      {/* 5. Knots / Lock Badge */}
      {knots > 0 && (
        <View style={styles.knotWrap}>
          <Text style={styles.knotText}>🔒{knots}</Text>
        </View>
      )}

      {/* 6. Rainbow Wild Icon Badge */}
      {isWild && (
        <View style={styles.wildPill}>
          <Text style={{ fontSize: 9 }}>🌈</Text>
        </View>
      )}

      {/* 7. Dual Color Pip (Upcoming inner yarn layer) */}
      {secondColor && (
        <View style={styles.dualPill}>
          <View style={[styles.dualDot, { backgroundColor: YARN[color]?.base ?? '#E62D3C' }]} />
          <Text style={styles.dualArrow}>→</Text>
          <View style={[styles.dualDot, { backgroundColor: YARN[secondColor]?.base ?? '#1973DC' }]} />
        </View>
      )}

      {/* 8. Twin Link Indicator */}
      {twinColor && (
        <View style={[styles.twinDot, { backgroundColor: twinColor }]} />
      )}

      {/* 8b. Colour-blind shape symbol */}
      {colorBlind && !isConcealed && !isWild && COLOR_SYMBOL[color] && (
        <View
          style={[
            styles.cbBadge,
            {
              width: Math.max(16, w * 0.34),
              height: Math.max(16, w * 0.34),
              borderRadius: Math.max(8, w * 0.17),
              borderColor: YARN[color]?.light ?? '#FFF',
            },
          ]}
        >
          <Text style={[styles.cbText, { fontSize: Math.max(10, w * 0.22) }]}>{COLOR_SYMBOL[color]}</Text>
        </View>
      )}

      {/* 9. Frozen Ice Shield Overlay */}
      {frozen > 0 && (
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: 'rgba(175, 230, 255, 0.52)',
              borderRadius: 8,
              borderWidth: 2,
              borderColor: '#B0EEFF',
              alignItems: 'center',
              justifyContent: 'center',
            },
          ]}
        >
          <View style={styles.frozenWrap}>
            <Text style={styles.frozenText}>❄️{frozen}</Text>
          </View>
        </View>
      )}
    </View>
  );
}

export const SpoolView = memo(SpoolImpl);

export function BasketView({ count, size }: { count: number; size: number }) {
  const w = size;
  const h = size * 0.88;

  return (
    <View style={[styles.root, { width: w, height: h, alignItems: 'center', justifyContent: 'center' }]}>
      <Image
        source={require('../../assets/sprites/wicker_basket.png')}
        style={{ width: w, height: h }}
        resizeMode="contain"
      />
      <View
        style={{
          position: 'absolute',
          bottom: -2,
          backgroundColor: '#5B3A5E',
          borderColor: '#FFC93C',
          borderWidth: 1.5,
          borderRadius: 10,
          paddingHorizontal: 6,
          paddingVertical: 1,
        }}
      >
        <Text style={{ color: '#FFF', fontSize: 10, fontWeight: '900' }}>+{count}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  socketSaucer: {
    position: 'absolute',
    backgroundColor: 'rgba(15, 6, 2, 0.48)',
    borderWidth: 1,
    borderColor: 'rgba(240, 205, 160, 0.22)',
  },
  badge: {
    position: 'absolute',
    alignSelf: 'center',
    backgroundColor: '#FFFDF6',
    borderWidth: 1.5,
    borderColor: '#D4AF37',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1A0802',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 3,
  },
  badgeText: {
    fontWeight: '900',
    color: '#281105',
    textAlign: 'center',
  },
  hiddenBadge: {
    position: 'absolute',
    alignSelf: 'center',
    backgroundColor: '#3D2010',
    borderWidth: 1.5,
    borderColor: '#E8C5A0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hiddenText: {
    fontWeight: '900',
    color: '#FFF',
    textAlign: 'center',
  },
  knotWrap: {
    position: 'absolute',
    top: 4,
    backgroundColor: '#D4A373',
    paddingHorizontal: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#5C3A21',
  },
  knotText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#3D1D09',
  },
  twinDot: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#FFF',
  },
  wildBadgeContainer: {
    backgroundColor: '#FFEAA7',
    borderColor: '#E17055',
  },
  wildBadgeText: {
    color: '#D63031',
  },
  wildPill: {
    position: 'absolute',
    top: 2,
    left: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 6,
    paddingHorizontal: 2,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  dualPill: {
    position: 'absolute',
    bottom: 2,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 15, 8, 0.88)',
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderWidth: 1,
    borderColor: '#FFD9C2',
    gap: 2,
  },
  dualDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    borderWidth: 0.5,
    borderColor: '#FFF',
  },
  dualArrow: {
    color: '#FFF',
    fontSize: 8,
    fontWeight: '900',
  },
  frozenWrap: {
    backgroundColor: 'rgba(235, 250, 255, 0.92)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#00B4D8',
    shadowColor: '#0077B6',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  frozenText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#0077B6',
  },
  cbBadge: {
    position: 'absolute',
    bottom: 1,
    left: 1,
    backgroundColor: 'rgba(20, 10, 4, 0.88)',
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cbText: {
    color: '#FFFFFF',
    fontWeight: '900',
    textAlign: 'center',
    includeFontPadding: false,
  },
});
