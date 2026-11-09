import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Image, StyleSheet, Text, View } from 'react-native';
import Svg, {
  Defs,
  G,
  Line,
  LinearGradient,
  Path,
  Stop,
} from 'react-native-svg';
import { GameState } from '../game/engine';
import { TrackShape } from '../game/levels';
import { useSave } from '../save';
import { COLOR_SYMBOL, UI, YARN } from '../theme';

export type { TrackShape };

interface Props {
  game: GameState;
  trackShape?: TrackShape;
  viewWidth: number;
  viewHeight: number;
  activeUnravel: {
    spoolSlot: number;
    color: string;
    headX: number;
    headY: number;
  } | null;
  slotCoords: { x: number; y: number }[];
  paused?: boolean;
}

const SPRITES: Record<string, number> = {
  R: require('../../assets/sprites/seg_R.png'),
  O: require('../../assets/sprites/seg_O.png'),
  Y: require('../../assets/sprites/seg_Y.png'),
  G: require('../../assets/sprites/seg_G.png'),
  B: require('../../assets/sprites/seg_B.png'),
  P: require('../../assets/sprites/seg_P.png'),
  K: require('../../assets/sprites/seg_K.png'),
  T: require('../../assets/sprites/seg_T.png'),
};

const DRAGON_HEAD = require('../../assets/sprites/dragon_head.png');
const WICKER_BASKET = require('../../assets/sprites/wicker_basket.png');

interface TrackPoint {
  x: number;
  y: number;
  angle: number;
  nx: number;
  ny: number;
  dist: number;
}

interface TrackLUT {
  total: number;
  sample: (d: number) => TrackPoint;
  basket: TrackPoint;
  pts: { x: number; y: number }[];
}

interface ZoneGeometry {
  d: string;
  leftRailD: string;
  rightRailD: string;
  planks: Array<{ x1: number; y1: number; x2: number; y2: number }>;
  midPt: TrackPoint;
}

/**
 * Builds SVG paths & cross-plank coordinates for a track zone (Bridge or Ice Zone)
 * spanning from `startPct` (0..100) to `endPct` (0..100).
 */
function buildZoneGeometry(
  lut: TrackLUT,
  startPct: number,
  endPct: number,
  halfWidth: number,
): ZoneGeometry {
  const d0 = Math.max(0, Math.min(1, startPct / 100)) * lut.total;
  const d1 = Math.max(0, Math.min(1, endPct / 100)) * lut.total;
  const span = Math.max(10, d1 - d0);
  const steps = 28;
  let d = '';
  let leftRailD = '';
  let rightRailD = '';

  for (let i = 0; i <= steps; i++) {
    const dist = d0 + (span * i) / steps;
    const pt = lut.sample(dist);
    const lx = pt.x + pt.nx * halfWidth;
    const ly = pt.y + pt.ny * halfWidth;
    const rx = pt.x - pt.nx * halfWidth;
    const ry = pt.y - pt.ny * halfWidth;

    const cmd = i === 0 ? 'M' : 'L';
    d += `${i === 0 ? '' : ' '}${cmd} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`;
    leftRailD += `${i === 0 ? '' : ' '}${cmd} ${lx.toFixed(1)} ${ly.toFixed(1)}`;
    rightRailD += `${i === 0 ? '' : ' '}${cmd} ${rx.toFixed(1)} ${ry.toFixed(1)}`;
  }

  const plankCount = Math.max(6, Math.min(16, Math.round(span / 11)));
  const planks: Array<{ x1: number; y1: number; x2: number; y2: number }> = [];
  for (let i = 0; i <= plankCount; i++) {
    const dist = d0 + (span * i) / plankCount;
    const pt = lut.sample(dist);
    planks.push({
      x1: pt.x + pt.nx * (halfWidth * 0.96),
      y1: pt.y + pt.ny * (halfWidth * 0.96),
      x2: pt.x - pt.nx * (halfWidth * 0.96),
      y2: pt.y - pt.ny * (halfWidth * 0.96),
    });
  }

  const midPt = lut.sample((d0 + d1) * 0.5);
  return { d, leftRailD, rightRailD, planks, midPt };
}

/**
 * Arc-Length Parameterization Look-Up Table (LUT) Engine:
 * Generates mathematically continuous, grand 3D winding tracks with:
 * 1. Constant Physical Speed (px/s) across straight stretches, curves, loops & spirals.
 * 2. Uniform cable-knit ring spacing (zero bunching on turns, zero stretching on straights).
 * 3. Guaranteed inner padding (zero edge clipping on any screen).
 */
function createTrackLUT(shape: TrackShape, W: number, H: number): TrackLUT {
  const padX = Math.max(26, W * 0.07);
  const padYTop = Math.max(22, H * 0.06);
  const padYBottom = Math.max(34, H * 0.08);
  const cx = W * 0.50;
  const cy = padYTop + (H - padYTop - padYBottom) * 0.50;
  const rxMax = (W - 2 * padX) * 0.50;
  const ryMax = (H - padYTop - padYBottom) * 0.50;

  function rawPt(p: number) {
    const t = Math.max(0, Math.min(1, p));
    switch (shape) {
      case 'clover': {
        const theta = -Math.PI * 0.5 + t * Math.PI * 4.4;
        const rFactor = (1.0 - t * 0.45) * (0.84 + 0.16 * Math.cos(4 * theta));
        return { x: cx + rxMax * rFactor * Math.cos(theta), y: cy + ryMax * rFactor * Math.sin(theta) };
      }
      case 'horseshoe': {
        const theta = -Math.PI * 0.85 + t * Math.PI * 3.4;
        const rFactor = 0.96 - t * 0.48;
        return { x: cx + rxMax * rFactor * Math.cos(theta), y: cy + ryMax * rFactor * Math.sin(theta) };
      }
      case 'labyrinth':
      case 's_curve': {
        const theta = t * Math.PI * 5.0;
        return {
          x: cx + rxMax * 0.94 * Math.cos(theta),
          y: padYTop + (H - padYTop - padYBottom) * (t * 0.90 + 0.05 * Math.sin(theta)),
        };
      }
      case 'rollercoaster': {
        const theta = t * Math.PI * 3.6 - Math.PI * 0.5;
        const decay = 1.0 - t * 0.42;
        const modX = Math.cos(theta) + 0.20 * Math.sin(2 * theta);
        const modY = Math.sin(theta) + 0.22 * Math.cos(2 * theta);
        return {
          x: cx + rxMax * modX * decay * 0.82,
          y: cy + ryMax * modY * decay * 0.82,
        };
      }
      case 'infinity': {
        const theta = t * Math.PI * 2.6 - Math.PI * 0.5;
        const rFactor = 0.98 - t * 0.30;
        const denom = 1 + Math.sin(theta) * Math.sin(theta);
        return {
          x: cx + (rxMax * rFactor * Math.cos(theta)) / denom,
          y: cy + (ryMax * rFactor * Math.sin(theta) * Math.cos(theta) * 1.85) / denom,
        };
      }
      case 'heart': {
        const theta = -Math.PI * 0.5 + t * Math.PI * 3.4;
        const decay = 1.0 - t * 0.38;
        const sinT = Math.sin(theta);
        const hx = 16 * Math.pow(sinT, 3);
        const hy = -(13 * Math.cos(theta) - 5 * Math.cos(2 * theta) - 2 * Math.cos(3 * theta) - Math.cos(4 * theta));
        return {
          x: cx + (hx / 16) * rxMax * decay * 0.88,
          y: cy + (hy / 17) * ryMax * decay * 0.90,
        };
      }
      case 'butterfly': {
        const theta = -Math.PI * 0.5 + t * Math.PI * 4.2;
        const decay = 1.0 - t * 0.42;
        const wing = Math.sin(theta) * (Math.exp(Math.cos(theta)) - 2 * Math.cos(4 * theta));
        const wingY = Math.cos(theta) * (Math.exp(Math.cos(theta)) - 2 * Math.cos(4 * theta));
        return {
          x: cx + (wing / 3.4) * rxMax * decay * 0.88,
          y: cy + (wingY / 3.4) * ryMax * decay * 0.88,
        };
      }
      case 'pretzel': {
        const theta = t * Math.PI * 3.4 - Math.PI * 0.5;
        const decay = 1.0 - t * 0.38;
        const px = Math.sin(theta) + 0.55 * Math.sin(2 * theta);
        const py = Math.cos(theta) - 0.55 * Math.cos(2 * theta);
        return {
          x: cx + (px / 1.55) * rxMax * decay * 0.90,
          y: cy + (py / 1.55) * ryMax * decay * 0.90,
        };
      }
      case 'blossom': {
        const theta = -Math.PI * 0.5 + t * Math.PI * 4.6;
        const rFactor = (1.0 - t * 0.48) * (0.80 + 0.20 * Math.cos(5 * theta));
        return {
          x: cx + rxMax * rFactor * Math.cos(theta),
          y: cy + ryMax * rFactor * Math.sin(theta),
        };
      }
      case 'zigzag_grand': {
        const theta = t * Math.PI * 5.6;
        const progressY = t * 0.88 + 0.06;
        return {
          x: cx + rxMax * 0.92 * Math.sin(theta),
          y: padYTop + (H - padYTop - padYBottom) * progressY,
        };
      }
      case 'yin_yang': {
        const theta = t * Math.PI * 3.6 - Math.PI * 0.5;
        const rFactor = (1.0 - t * 0.48) * (0.84 + 0.16 * Math.sin(2 * theta));
        return {
          x: cx + rxMax * rFactor * Math.cos(theta),
          y: cy + ryMax * rFactor * Math.sin(theta),
        };
      }
      case 'diamond': {
        const theta = t * Math.PI * 3.8 - Math.PI * 0.25;
        const decay = 1.0 - t * 0.42;
        const cosD = Math.pow(Math.abs(Math.cos(theta)), 0.65) * Math.sign(Math.cos(theta));
        const sinD = Math.pow(Math.abs(Math.sin(theta)), 0.65) * Math.sign(Math.sin(theta));
        return {
          x: cx + rxMax * cosD * decay * 0.90,
          y: cy + ryMax * sinD * decay * 0.90,
        };
      }
      case 'snail_shell': {
        const theta = -Math.PI * 0.4 + t * Math.PI * 4.4;
        const rFactor = (1.0 - t * 0.56) * 0.96;
        return {
          x: cx + rxMax * rFactor * Math.cos(theta) * 0.96,
          y: cy + ryMax * rFactor * Math.sin(theta) * 0.96,
        };
      }
      case 'guitar': {
        const theta = t * Math.PI * 3.2 - Math.PI * 0.5;
        const waist = 0.72 + 0.28 * Math.cos(2 * theta);
        const decay = 1.0 - t * 0.38;
        return {
          x: cx + rxMax * Math.cos(theta) * waist * decay * 0.92,
          y: cy + ryMax * Math.sin(theta) * decay * 0.92,
        };
      }
      case 'star_spiral': {
        const theta = -Math.PI * 0.5 + t * Math.PI * 4.6;
        const starMod = 0.82 + 0.18 * Math.cos(5 * theta);
        const decay = 1.0 - t * 0.44;
        return {
          x: cx + rxMax * Math.cos(theta) * starMod * decay * 0.90,
          y: cy + ryMax * Math.sin(theta) * starMod * decay * 0.90,
        };
      }
      case 'serpentine_waves': {
        const theta = t * Math.PI * 5.2;
        const waveY = t * 0.86 + 0.07;
        return {
          x: cx + rxMax * 0.90 * Math.cos(theta),
          y: padYTop + (H - padYTop - padYBottom) * (waveY + 0.04 * Math.sin(theta * 2)),
        };
      }
      case 'hourglass': {
        const theta = t * Math.PI * 2.8 - Math.PI * 0.5;
        const pinch = 0.58 + 0.42 * Math.abs(Math.sin(theta));
        const decay = 1.0 - t * 0.32;
        return {
          x: cx + rxMax * Math.cos(theta) * pinch * decay * 0.92,
          y: cy + ryMax * Math.sin(theta) * decay * 0.92,
        };
      }
      case 'bridge_cross': {
        // Grand Overpass Arch & Underpass Sweep (L19+ Bridge Track)
        const theta = -Math.PI * 0.65 + t * Math.PI * 3.6;
        const decay = 0.96 - t * 0.46;
        const pinchX = 0.84 + 0.16 * Math.cos(2 * theta);
        return {
          x: cx + rxMax * Math.cos(theta) * pinchX * decay,
          y: cy + ryMax * (Math.sin(theta) + 0.18 * Math.sin(3 * theta)) * decay * 0.88,
        };
      }
      case 'frozen_fjord': {
        // Nordic Glacial Fjord Serpentine (L20+ Ice Zone Track)
        const theta = -Math.PI * 0.5 + t * Math.PI * 4.0;
        const rFactor = (0.96 - t * 0.48) * (0.85 + 0.15 * Math.sin(3 * theta));
        return {
          x: cx + rxMax * rFactor * Math.cos(theta),
          y: cy + ryMax * rFactor * Math.sin(theta),
        };
      }
      case 'carousel_circus': {
        // 6-Scallop Festive Carousel Coil (L21+ Conveyor Track)
        const theta = -Math.PI * 0.5 + t * Math.PI * 4.2;
        const rFactor = (0.96 - t * 0.48) * (0.86 + 0.14 * Math.cos(6 * theta));
        return {
          x: cx + rxMax * rFactor * Math.cos(theta),
          y: cy + ryMax * rFactor * Math.sin(theta),
        };
      }
      case 'dragon_spiral': {
        // Coiling Dragon Tail Vortex
        const theta = -Math.PI * 0.35 + t * Math.PI * 4.3;
        const rFactor = (0.97 - t * 0.54) * (0.90 + 0.10 * Math.sin(2 * theta));
        return {
          x: cx + rxMax * rFactor * Math.cos(theta),
          y: cy + ryMax * rFactor * Math.sin(theta),
        };
      }
      case 'escalator_zigzag': {
        // Terraced Escalator Cascade
        const theta = t * Math.PI * 4.8;
        const stepY = t * 0.86 + 0.07;
        return {
          x: cx + rxMax * 0.90 * Math.sin(theta + 0.25 * Math.sin(2 * theta)),
          y: padYTop + (H - padYTop - padYBottom) * stepY,
        };
      }
      case 'celtic_nexus': {
        // 3-Lobe Triquetra Celtic Nexus
        const theta = -Math.PI * 0.5 + t * Math.PI * 4.1;
        const rFactor = (0.96 - t * 0.46) * (0.82 + 0.18 * Math.cos(3 * theta));
        return {
          x: cx + rxMax * rFactor * Math.cos(theta),
          y: cy + ryMax * rFactor * Math.sin(theta),
        };
      }
      case 'spiral':
      default: {
        const theta = -Math.PI * 0.5 + t * Math.PI * 3.8;
        const rFactor = 0.96 - t * 0.52;
        return { x: cx + rxMax * rFactor * Math.cos(theta), y: cy + ryMax * rFactor * Math.sin(theta) };
      }
    }
  }

  const N = 800;
  const pts: { x: number; y: number }[] = [];
  const dists: number[] = [0];
  let total = 0;
  let last = rawPt(0);
  pts.push(last);

  for (let i = 1; i <= N; i++) {
    const pt = rawPt(i / N);
    pts.push(pt);
    total += Math.hypot(pt.x - last.x, pt.y - last.y);
    dists.push(total);
    last = pt;
  }

  function sample(d: number): TrackPoint {
    const target = Math.max(0, Math.min(total, d));
    let low = 0, high = N;
    while (low <= high) {
      const mid = (low + high) >> 1;
      if (dists[mid] < target) low = mid + 1;
      else high = mid - 1;
    }
    const idx = Math.max(0, Math.min(N - 1, low - 1));
    const d0 = dists[idx];
    const d1 = dists[idx + 1] || d0;
    const segLen = d1 - d0 || 1;
    const frac = (target - d0) / segLen;

    const p0 = pts[idx];
    const p1 = pts[idx + 1] || p0;
    const x = p0.x + (p1.x - p0.x) * frac;
    const y = p0.y + (p1.y - p0.y) * frac;

    const fIdx = Math.min(N, idx + 2);
    const bIdx = Math.max(0, idx - 1);
    const dx = pts[fIdx].x - pts[bIdx].x;
    const dy = pts[fIdx].y - pts[bIdx].y;
    const len = Math.hypot(dx, dy) || 1;
    const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

    return { x, y, angle, nx: -dy / len, ny: dx / len, dist: target };
  }

  const basket = sample(total);
  return { total, sample, basket, pts };
}

const RingItem = React.memo(function RingItem({
  x,
  y,
  size,
  angle,
  scale,
  color,
}: {
  x: number;
  y: number;
  size: number;
  angle: number;
  scale: number;
  color: string;
}) {
  const spriteSource = SPRITES[color] ?? SPRITES.R;
  return (
    <View
      style={[
        styles.jointWrap,
        {
          left: x - size / 2,
          top: y - size / 2,
          width: size,
          height: size,
          transform: [
            { rotate: `${angle.toFixed(1)}deg` },
            { scale },
          ],
        },
      ]}
      pointerEvents="none"
    >
      <Image
        source={spriteSource}
        style={{ width: '100%', height: '100%' }}
        resizeMode="contain"
      />
    </View>
  );
});

export function SnakeTrackView({
  game,
  trackShape = 's_curve',
  viewWidth,
  viewHeight,
  activeUnravel,
  slotCoords,
  paused = false,
}: Props) {
  const colorBlind = !!useSave().data.colorBlind;

  // 1. Arc-Length Parameterized Track Engine:
  const lut = useMemo(
    () => createTrackLUT(trackShape, viewWidth, viewHeight),
    [trackShape, viewWidth, viewHeight],
  );

  // Alive breathing bob animation for the dragon head (runs on Native UI thread, 0% JS CPU)
  const headBreath = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (paused) {
      headBreath.stopAnimation();
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(headBreath, {
          toValue: 1.06,
          duration: 600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(headBreath, {
          toValue: 1.0,
          duration: 600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [headBreath, paused]);

  // 2. Thermal-Friendly Smooth Interpolation Loop (20 FPS cap instead of unthrottled 120Hz rAF):
  // Prevents iPhone overheating while keeping dragon motion silky-smooth!
  const visualHeadPos = useRef(game.headPos);
  const [renderHeadPos, setRenderHeadPos] = useState(game.headPos);
  const [unravelWaveTick, setUnravelWaveTick] = useState(0);

  useEffect(() => {
    if (paused) return;

    const timer = setInterval(() => {
      const target = game.headPos;
      const diff = target - visualHeadPos.current;

      if (Math.abs(diff) > 0.03) {
        visualHeadPos.current += diff * 0.42;
        const quantized = Math.round(visualHeadPos.current * 25) / 25;
        setRenderHeadPos((prev) => (Math.abs(prev - quantized) >= 0.03 ? quantized : prev));
      } else if (Math.abs(visualHeadPos.current - target) > 0.005) {
        visualHeadPos.current = target;
        setRenderHeadPos(target);
      }

      if (activeUnravel) {
        setUnravelWaveTick((t) => (t + 1) % 10000);
      }
    }, 50);

    return () => clearInterval(timer);
  }, [game.headPos, activeUnravel, paused]);

  // Track path spline from dense points (clean SVG curve):
  const trackPath = useMemo(() => {
    let d = '';
    const pts = lut.pts;
    for (let i = 0; i < pts.length; i += 4) {
      const pt = pts[i];
      d += i === 0 ? `M ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}` : ` L ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`;
    }
    const last = pts[pts.length - 1];
    d += ` L ${last.x.toFixed(1)} ${last.y.toFixed(1)}`;
    return d;
  }, [lut]);

  const basketHole = lut.basket;
  const jointSize = Math.max(32, Math.min(46, viewWidth * 0.11, viewHeight * 0.115));
  const headSize = jointSize * 1.50;
  const basketSize = Math.max(76, Math.min(92, jointSize * 2.05));
  const ringSpacing = Math.max(16, jointSize * 0.52);

  // Precompute Wooden Bridge & Frozen Track Zone Geometries
  const bridgeStart = game.bridge?.start ?? null;
  const bridgeEnd = game.bridge?.end ?? null;
  const bridgeGeom = useMemo(() => {
    if (bridgeStart === null || bridgeEnd === null) return null;
    return buildZoneGeometry(lut, bridgeStart, bridgeEnd, jointSize * 0.68);
  }, [lut, bridgeStart, bridgeEnd, jointSize]);

  const iceStart = game.iceZone?.start ?? null;
  const iceEnd = game.iceZone?.end ?? null;
  const iceGeom = useMemo(() => {
    if (iceStart === null || iceEnd === null) return null;
    return buildZoneGeometry(lut, iceStart, iceEnd, jointSize * 0.62);
  }, [lut, iceStart, iceEnd, jointSize]);

  const isIceThawed = (game.iceZone?.thawDuration ?? 0) > 0;
  const isHeadUnderBridge =
    !!game.bridge && renderHeadPos >= game.bridge.start && renderHeadPos <= game.bridge.end;
  const isHeadFrozenInIce =
    !!game.iceZone &&
    !isIceThawed &&
    renderHeadPos >= game.iceZone.start &&
    renderHeadPos <= game.iceZone.end;

  const { rings, headPos, neckPos, headAngle } = useMemo(() => {
    const list: Array<{
      id: string;
      x: number;
      y: number;
      angle: number;
      color: string;
      scale: number;
      mark: boolean;
    }> = [];

    const headT = Math.min(0.97, Math.max(0.04, renderHeadPos / 100));
    const headDist = headT * lut.total;
    const headPt = lut.sample(headDist);
    const slitherPhase = headDist * 0.055;

    let ringIndex = 0;
    for (let sIdx = 0; sIdx < game.segments.length; sIdx++) {
      const seg = game.segments[sIdx];
      for (let unit = 0; unit < seg.units; unit++) {
        const ringDist = headDist - (ringIndex + 1) * ringSpacing;
        const sampleDist = Math.max(0, ringDist);
        const ringPt = lut.sample(sampleDist);

        const wave = Math.sin(slitherPhase - ringIndex * 0.48) * 2.4;
        const enterScale = ringDist < 0 ? Math.max(0, 1 + ringDist / ringSpacing) : 1.0;
        const baseScale = ringIndex === 0 ? 1.06 : 1.01;

        list.push({
          id: `${seg.color}_${sIdx}_${unit}`,
          x: ringPt.x + ringPt.nx * wave,
          y: ringPt.y + ringPt.ny * wave,
          angle: ringPt.angle,
          color: seg.color,
          scale: baseScale * enterScale,
          mark: unit === Math.floor(seg.units / 2),
        });

        ringIndex++;
      }
    }

    const headWave = Math.sin(slitherPhase) * 1.8;
    const hPos = {
      x: headPt.x + headPt.nx * headWave,
      y: headPt.y + headPt.ny * headWave,
    };

    const rad = (headPt.angle * Math.PI) / 180;
    const cosA = Math.cos(rad);
    const sinA = Math.sin(rad);
    const neckPos = {
      x: hPos.x - cosA * (headSize * 0.40),
      y: hPos.y - sinA * (headSize * 0.40),
    };

    return {
      rings: list.reverse(),
      headPos: hPos,
      neckPos,
      headAngle: headPt.angle,
    };
  }, [renderHeadPos, game.segments, lut, jointSize, headSize, ringSpacing]);

  const targetSlot =
    activeUnravel && slotCoords[activeUnravel.spoolSlot]
      ? slotCoords[activeUnravel.spoolSlot]
      : null;

  const activeYarnColor = activeUnravel?.color ?? 'R';
  const yarnTheme = YARN[activeYarnColor] ?? YARN.R;

  return (
    <View style={[styles.container, { width: viewWidth, height: viewHeight }]} pointerEvents="box-none">
      {/* 1. Recessed Routered Wooden Canal + Frozen Ice Canal Bed */}
      <Svg width={viewWidth} height={viewHeight} style={StyleSheet.absoluteFill} pointerEvents="none">
        {/* Soft cast shadow in table around the canal */}
        <Path
          d={trackPath}
          stroke="rgba(25, 10, 4, 0.35)"
          strokeWidth={jointSize * 1.05}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          transform="translate(0, 3)"
        />

        {/* Subtle beveled wood edge catching ambient craft sunlight */}
        <Path
          d={trackPath}
          stroke="rgba(240, 205, 165, 0.32)"
          strokeWidth={jointSize * 0.95}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Deep carved inner trench shadow */}
        <Path
          d={trackPath}
          stroke="#42200C"
          strokeWidth={jointSize * 0.82}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Recessed dark trough bed */}
        <Path
          d={trackPath}
          stroke="#261005"
          strokeWidth={jointSize * 0.58}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Deep center shadow core */}
        <Path
          d={trackPath}
          stroke="#120602"
          strokeWidth={jointSize * 0.30}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          opacity={0.75}
        />

        {/* 1b. FROZEN TRACK ZONE (Buzlu Parkur Alanı) Canal Bed */}
        {iceGeom && (
          <G>
            {/* Outer frost aura / warm melted glow */}
            <Path
              d={iceGeom.d}
              stroke={isIceThawed ? 'rgba(245, 158, 11, 0.55)' : 'rgba(56, 189, 248, 0.65)'}
              strokeWidth={jointSize * 1.24}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            {/* Main glacial ice trench */}
            <Path
              d={iceGeom.d}
              stroke={isIceThawed ? '#D97706' : '#0284C7'}
              strokeWidth={jointSize * 0.96}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            {/* Translucent crystal ice bed */}
            <Path
              d={iceGeom.d}
              stroke={isIceThawed ? '#FDE68A' : '#7DD3FC'}
              strokeWidth={jointSize * 0.72}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            {/* Specular ice shimmer dashes */}
            <Path
              d={iceGeom.d}
              stroke="#FFFFFF"
              strokeWidth={jointSize * 0.32}
              strokeLinecap="round"
              strokeDasharray="8 6"
              fill="none"
              opacity={isIceThawed ? 0.5 : 0.85}
            />
          </G>
        )}
      </Svg>

      {/* 2. Photorealistic 3D Wicker Sewing Basket at Track Destination */}
      <View
        style={[
          styles.basketWrap,
          {
            left: basketHole.x - basketSize / 2,
            top: basketHole.y - basketSize / 2,
            width: basketSize,
            height: basketSize,
          },
        ]}
        pointerEvents="none"
      >
        <Image
          source={WICKER_BASKET}
          style={{ width: basketSize, height: basketSize }}
          resizeMode="contain"
        />
      </View>

      {/* 3. The 3D Interlocking Cable-Knit Rings */}
      {rings.map((ring) => (
        <RingItem
          key={ring.id}
          x={ring.x}
          y={ring.y}
          size={jointSize * ring.scale}
          angle={ring.angle}
          scale={ring.scale}
          color={ring.color}
        />
      ))}

      {/* 3b. Colour-blind shape symbols */}
      {colorBlind &&
        rings
          .filter((r) => r.mark && COLOR_SYMBOL[r.color])
          .map((ring) => {
            const s = Math.max(14, jointSize * 0.46);
            return (
              <View
                key={`cb_${ring.id}`}
                pointerEvents="none"
                style={[
                  styles.cbMark,
                  {
                    left: ring.x - s / 2,
                    top: ring.y - s / 2,
                    width: s,
                    height: s,
                    borderRadius: s / 2,
                  },
                ]}
              >
                <Text style={[styles.cbMarkText, { fontSize: s * 0.62 }]}>
                  {COLOR_SYMBOL[ring.color]}
                </Text>
              </View>
            );
          })}

      {/* 4. Alive 3D Cable-Knit Dragon Head */}
      {game.segments.length > 0 && (
        <Animated.View
          style={[
            styles.headWrap,
            {
              left: headPos.x - headSize / 2,
              top: headPos.y - headSize / 2,
              width: headSize,
              height: headSize,
              transform: [
                { rotate: `${headAngle.toFixed(1)}deg` },
                { scale: headBreath },
              ],
            },
          ]}
          pointerEvents="none"
        >
          <Image
            source={DRAGON_HEAD}
            style={{ width: '100%', height: '100%' }}
            resizeMode="contain"
          />
          {isHeadFrozenInIce && (
            <View style={styles.headIceLockRing} pointerEvents="none" />
          )}
        </Animated.View>
      )}

      {/* 4b. OVERPASS OBSTACLES: Wooden Bridge (🌉) & Ice Zone Frost Banks (❄️) OVER the Snake! */}
      {(bridgeGeom || iceGeom) && (
        <Svg
          width={viewWidth}
          height={viewHeight}
          style={[StyleSheet.absoluteFill, { zIndex: 30 }]}
          pointerEvents="none"
        >
          {/* Ice Zone Frosted Snowbank Rails & Crystal Glaze OVER the Snake */}
          {iceGeom && (
            <G>
              {!isIceThawed && (
                <Path
                  d={iceGeom.d}
                  stroke="rgba(186, 230, 253, 0.38)"
                  strokeWidth={jointSize * 0.88}
                  strokeLinecap="round"
                  fill="none"
                />
              )}
              <Path
                d={iceGeom.leftRailD}
                stroke={isIceThawed ? '#F59E0B' : '#E0F2FE'}
                strokeWidth={5.5}
                strokeLinecap="round"
                strokeDasharray="10 5"
                fill="none"
              />
              <Path
                d={iceGeom.rightRailD}
                stroke={isIceThawed ? '#F59E0B' : '#E0F2FE'}
                strokeWidth={5.5}
                strokeLinecap="round"
                strokeDasharray="10 5"
                fill="none"
              />
              <Path
                d={iceGeom.leftRailD}
                stroke={isIceThawed ? '#FEF3C7' : '#38BDF8'}
                strokeWidth={2.5}
                strokeLinecap="round"
                fill="none"
              />
              <Path
                d={iceGeom.rightRailD}
                stroke={isIceThawed ? '#FEF3C7' : '#38BDF8'}
                strokeWidth={2.5}
                strokeLinecap="round"
                fill="none"
              />
            </G>
          )}

          {/* 3D Artisan Wooden Bridge Spanning OVER the Track & Snake */}
          {bridgeGeom && (
            <G>
              {/* Deep drop shadow cast by the wooden bridge onto the snake & table */}
              <Path
                d={bridgeGeom.d}
                stroke="rgba(15, 6, 2, 0.58)"
                strokeWidth={jointSize * 1.42}
                strokeLinecap="butt"
                strokeLinejoin="round"
                fill="none"
                transform="translate(0, 6)"
              />
              {/* Dark walnut support deck under-beams */}
              <Path
                d={bridgeGeom.d}
                stroke="#3E1D08"
                strokeWidth={jointSize * 1.28}
                strokeLinecap="butt"
                strokeLinejoin="round"
                fill="none"
              />
              {/* Warm cedar bridge deck floor */}
              <Path
                d={bridgeGeom.d}
                stroke="#7C3F14"
                strokeWidth={jointSize * 1.12}
                strokeLinecap="butt"
                strokeLinejoin="round"
                fill="none"
              />
              {/* Transverse Wooden Bridge Planks */}
              {bridgeGeom.planks.map((pl, idx) => (
                <G key={`plank_${idx}`}>
                  <Line
                    x1={pl.x1}
                    y1={pl.y1 + 1.5}
                    x2={pl.x2}
                    y2={pl.y2 + 1.5}
                    stroke="#2B1204"
                    strokeWidth={6.5}
                    strokeLinecap="round"
                  />
                  <Line
                    x1={pl.x1}
                    y1={pl.y1}
                    x2={pl.x2}
                    y2={pl.y2}
                    stroke={idx % 2 === 0 ? '#C87D3B' : '#B56928'}
                    strokeWidth={5.2}
                    strokeLinecap="round"
                  />
                  <Line
                    x1={pl.x1}
                    y1={pl.y1}
                    x2={pl.x2}
                    y2={pl.y2}
                    stroke="#F3C68F"
                    strokeWidth={1.6}
                    strokeLinecap="round"
                    opacity={0.75}
                  />
                </G>
              ))}
              {/* Left & Right Carved Wooden Handrails */}
              <Path
                d={bridgeGeom.leftRailD}
                stroke="#4A2108"
                strokeWidth={7}
                strokeLinecap="round"
                fill="none"
              />
              <Path
                d={bridgeGeom.rightRailD}
                stroke="#4A2108"
                strokeWidth={7}
                strokeLinecap="round"
                fill="none"
              />
              <Path
                d={bridgeGeom.leftRailD}
                stroke="#DDA15E"
                strokeWidth={3.2}
                strokeLinecap="round"
                strokeDasharray="6 8"
                fill="none"
              />
              <Path
                d={bridgeGeom.rightRailD}
                stroke="#DDA15E"
                strokeWidth={3.2}
                strokeLinecap="round"
                strokeDasharray="6 8"
                fill="none"
              />
            </G>
          )}
        </Svg>
      )}

      {/* 4c. Floating Obstacle Badges for Wooden Bridge & Ice Zone */}
      {bridgeGeom && (
        <View
          pointerEvents="none"
          style={[
            styles.zoneBadge,
            {
              left: Math.max(8, Math.min(viewWidth - 88, bridgeGeom.midPt.x - 38)),
              top: Math.max(6, Math.min(viewHeight - 32, bridgeGeom.midPt.y - 14)),
              backgroundColor: isHeadUnderBridge ? '#FEF3C7' : 'rgba(62, 29, 8, 0.92)',
              borderColor: isHeadUnderBridge ? '#F59E0B' : '#DDA15E',
            },
          ]}
        >
          <Text
            style={[
              styles.zoneBadgeText,
              { color: isHeadUnderBridge ? '#92400E' : '#FDE68A' },
            ]}
          >
            {isHeadUnderBridge ? '🌉 Korumalı' : '🌉 Köprü'}
          </Text>
        </View>
      )}

      {iceGeom && (
        <View
          pointerEvents="none"
          style={[
            styles.zoneBadge,
            {
              left: Math.max(8, Math.min(viewWidth - 96, iceGeom.midPt.x - 42)),
              top: Math.max(6, Math.min(viewHeight - 32, iceGeom.midPt.y - 14)),
              backgroundColor: isIceThawed
                ? 'rgba(254, 243, 199, 0.95)'
                : isHeadFrozenInIce
                ? '#0284C7'
                : 'rgba(12, 74, 110, 0.90)',
              borderColor: isIceThawed ? '#F59E0B' : '#7DD3FC',
            },
          ]}
        >
          <Text
            style={[
              styles.zoneBadgeText,
              { color: isIceThawed ? '#92400E' : '#F0F9FF' },
            ]}
          >
            {isIceThawed
              ? `🔥 Çözüldü (${game.iceZone?.thawDuration})`
              : isHeadFrozenInIce
              ? '❄️ Dondu!'
              : '❄️ Buzlu Alan'}
          </Text>
        </View>
      )}

      {/* 5. Dynamic Live Unraveling Flying Wool Strand */}
      {targetSlot && (
        <Svg
          width={viewWidth}
          height={Math.max(viewHeight + 450, targetSlot.y + 80)}
          style={[
            styles.unravelSvg,
            { width: viewWidth, height: Math.max(viewHeight + 450, targetSlot.y + 80) },
          ]}
          pointerEvents="none"
        >
          <Defs>
            <LinearGradient id="woolCurlGrad" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%" stopColor={yarnTheme.light} />
              <Stop offset="50%" stopColor={yarnTheme.base} />
              <Stop offset="100%" stopColor={yarnTheme.dark} />
            </LinearGradient>
          </Defs>
          <G>
            {(() => {
              const x0 = neckPos.x;
              const y0 = neckPos.y;
              const x1 = targetSlot.x;
              const y1 = targetSlot.y;

              const dx = x1 - x0;
              const dy = y1 - y0;
              const dist = Math.max(1, Math.sqrt(dx * dx + dy * dy));

              const nx = -dy / dist;
              const ny = dx / dist;

              const flutter = Math.sin(unravelWaveTick * 0.7) * 3.2;
              const side = dx >= 0 ? 1 : -1;
              const bow = side * Math.min(38, Math.max(16, dist * 0.15)) + flutter;

              const cpX = (x0 + x1) / 2 + nx * bow;
              const cpY = (y0 + y1) / 2 + ny * bow - 10;

              const N_SEG = 26;
              const crimpPhase = (unravelWaveTick * 0.45) % (Math.PI * 2);
              const numWaves = Math.max(7, Math.min(16, dist / 26));
              const pts: { x: number; y: number }[] = [];

              for (let i = 0; i <= N_SEG; i++) {
                const t = i / N_SEG;
                const inv = 1 - t;
                const bx = inv * inv * x0 + 2 * inv * t * cpX + t * t * x1;
                const by = inv * inv * y0 + 2 * inv * t * cpY + t * t * y1;

                const tx = 2 * inv * (cpX - x0) + 2 * t * (x1 - cpX);
                const ty = 2 * inv * (cpY - y0) + 2 * t * (y1 - cpY);
                const tLen = Math.hypot(tx, ty) || 1;
                const pnx = -ty / tLen;
                const pny = tx / tLen;

                const env = Math.sin(t * Math.PI) * Math.max(0.8, 3.0 * (1 - t * 0.55));
                const wave = Math.sin(t * numWaves * Math.PI * 2 - crimpPhase) * env;

                pts.push({
                  x: bx + pnx * wave,
                  y: by + pny * wave,
                });
              }

              let yarnD = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
              for (let i = 1; i < pts.length; i++) {
                yarnD += ` L ${pts[i].x.toFixed(1)} ${pts[i].y.toFixed(1)}`;
              }

              return (
                <G>
                  <Path
                    d={yarnD}
                    stroke="rgba(25, 10, 4, 0.28)"
                    strokeWidth={4.8}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                    transform="translate(0, 3)"
                  />
                  <Path
                    d={yarnD}
                    stroke={yarnTheme.dark}
                    strokeWidth={4.0}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                  <Path
                    d={yarnD}
                    stroke="url(#woolCurlGrad)"
                    strokeWidth={2.8}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                  <Path
                    d={yarnD}
                    stroke="#FFF"
                    strokeWidth={1.2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                    opacity={0.65}
                    strokeDasharray="5 3"
                  />
                  <Path
                    d={yarnD}
                    stroke={yarnTheme.light}
                    strokeWidth={1.0}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                    opacity={0.7}
                    strokeDasharray="3 5"
                  />
                  <Path
                    d={`M ${(x1 - 10).toFixed(1)} ${(y1 - 1).toFixed(1)} A 10 3.5 0 1 0 ${(x1 + 10).toFixed(1)} ${(y1 - 1).toFixed(1)} A 10 3.5 0 1 0 ${(x1 - 10).toFixed(1)} ${(y1 - 1).toFixed(1)}`}
                    stroke={yarnTheme.dark}
                    strokeWidth={3.2}
                    fill="none"
                    strokeLinecap="round"
                  />
                  <Path
                    d={`M ${(x1 - 10).toFixed(1)} ${(y1 - 1).toFixed(1)} A 10 3.5 0 1 0 ${(x1 + 10).toFixed(1)} ${(y1 - 1).toFixed(1)} A 10 3.5 0 1 0 ${(x1 - 10).toFixed(1)} ${(y1 - 1).toFixed(1)}`}
                    stroke={yarnTheme.base}
                    strokeWidth={2.0}
                    fill="none"
                    strokeLinecap="round"
                  />
                </G>
              );
            })()}
          </G>
        </Svg>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    overflow: 'visible',
  },
  unravelSvg: {
    position: 'absolute',
    top: 0,
    left: 0,
    overflow: 'visible',
    zIndex: 40,
  },
  basketWrap: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cbMark: {
    position: 'absolute',
    backgroundColor: 'rgba(20, 10, 4, 0.82)',
    borderWidth: 1.5,
    borderColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cbMarkText: {
    color: '#FFF',
    fontWeight: '900',
    textAlign: 'center',
    includeFontPadding: false,
  },
  jointWrap: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headWrap: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
  headIceLockRing: {
    position: 'absolute',
    width: '92%',
    height: '92%',
    borderRadius: 999,
    borderWidth: 3,
    borderColor: '#38BDF8',
    backgroundColor: 'rgba(125, 211, 252, 0.28)',
  },
  zoneBadge: {
    position: 'absolute',
    zIndex: 35,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  zoneBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    textAlign: 'center',
    includeFontPadding: false,
  },
});
