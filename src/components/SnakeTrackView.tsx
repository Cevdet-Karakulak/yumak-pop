import React, { useEffect, useMemo, useRef, useState } from 'react';

import { Animated, Easing, Image, StyleSheet, Text, View } from 'react-native';

import Svg, {

  Circle,

  Defs,

  G,

  LinearGradient,

  Path,

  Stop,

} from 'react-native-svg';

import { GameState } from '../game/engine';
import { TrackShape } from '../game/levels';

import { UI, YARN } from '../theme';



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

        // Grand expansive 4-lobe cloverleaf serpentine filling the whole table canvas

        const theta = -Math.PI * 0.5 + t * Math.PI * 4.4;

        const rFactor = (1.0 - t * 0.45) * (0.84 + 0.16 * Math.cos(4 * theta));

        return { x: cx + rxMax * rFactor * Math.cos(theta), y: cy + ryMax * rFactor * Math.sin(theta) };

      }

      case 'horseshoe': {

        // Royal Horseshoe & Coiling Spiral

        const theta = -Math.PI * 0.85 + t * Math.PI * 3.4;

        const rFactor = 0.96 - t * 0.48;

        return { x: cx + rxMax * rFactor * Math.cos(theta), y: cy + ryMax * rFactor * Math.sin(theta) };

      }

      case 'labyrinth':

      case 's_curve': {

        // Intricate expansive Celtic labyrinth meander

        const theta = t * Math.PI * 5.0;

        return {

          x: cx + rxMax * 0.94 * Math.cos(theta),

          y: padYTop + (H - padYTop - padYBottom) * (t * 0.90 + 0.05 * Math.sin(theta)),

        };

      }

      case 'rollercoaster': {

        // Dynamic rollercoaster heart-loop

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

        // Expansive figure-8 infinity knot

        const theta = t * Math.PI * 2.6 - Math.PI * 0.5;

        const rFactor = 0.98 - t * 0.30;

        const denom = 1 + Math.sin(theta) * Math.sin(theta);

        return {

          x: cx + (rxMax * rFactor * Math.cos(theta)) / denom,

          y: cy + (ryMax * rFactor * Math.sin(theta) * Math.cos(theta) * 1.85) / denom,

        };

      }

      case 'heart': {

        // Romantic Celtic Heart Loop

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

        // Symmetrical Double Wing Wingsweep

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

        // Bavarian Pretzel Interlocking Triple Loop

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

        // 5-Petal Cherry Blossom Floral Coil

        const theta = -Math.PI * 0.5 + t * Math.PI * 4.6;

        const rFactor = (1.0 - t * 0.48) * (0.80 + 0.20 * Math.cos(5 * theta));

        return {

          x: cx + rxMax * rFactor * Math.cos(theta),

          y: cy + ryMax * rFactor * Math.sin(theta),

        };

      }

      case 'zigzag_grand': {

        // Grand Alpine Switchback S-curves

        const theta = t * Math.PI * 5.6;

        const progressY = t * 0.88 + 0.06;

        return {

          x: cx + rxMax * 0.92 * Math.sin(theta),

          y: padYTop + (H - padYTop - padYBottom) * progressY,

        };

      }

      case 'yin_yang': {

        // Dual Teardrop Balance Swirl

        const theta = t * Math.PI * 3.6 - Math.PI * 0.5;

        const rFactor = (1.0 - t * 0.48) * (0.84 + 0.16 * Math.sin(2 * theta));

        return {

          x: cx + rxMax * rFactor * Math.cos(theta),

          y: cy + ryMax * rFactor * Math.sin(theta),

        };

      }

      case 'diamond': {

        // Faceted Gemstone Diamond Circuit

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

        // Golden Ratio Nautilus Shell Spiral

        const theta = -Math.PI * 0.4 + t * Math.PI * 4.4;

        const rFactor = (1.0 - t * 0.56) * 0.96;

        return {

          x: cx + rxMax * rFactor * Math.cos(theta) * 0.96,

          y: cy + ryMax * rFactor * Math.sin(theta) * 0.96,

        };

      }

      case 'guitar': {

        // Contoured Double-Waisted Serpentine

        const theta = t * Math.PI * 3.2 - Math.PI * 0.5;

        const waist = 0.72 + 0.28 * Math.cos(2 * theta);

        const decay = 1.0 - t * 0.38;

        return {

          x: cx + rxMax * Math.cos(theta) * waist * decay * 0.92,

          y: cy + ryMax * Math.sin(theta) * decay * 0.92,

        };

      }

      case 'star_spiral': {

        // Radiant 5-Pointed Star Swirl

        const theta = -Math.PI * 0.5 + t * Math.PI * 4.6;

        const starMod = 0.82 + 0.18 * Math.cos(5 * theta);

        const decay = 1.0 - t * 0.44;

        return {

          x: cx + rxMax * Math.cos(theta) * starMod * decay * 0.90,

          y: cy + ryMax * Math.sin(theta) * starMod * decay * 0.90,

        };

      }

      case 'serpentine_waves': {

        // Deep Ocean Ripple Waves

        const theta = t * Math.PI * 5.2;

        const waveY = t * 0.86 + 0.07;

        return {

          x: cx + rxMax * 0.90 * Math.cos(theta),

          y: padYTop + (H - padYTop - padYBottom) * (waveY + 0.04 * Math.sin(theta * 2)),

        };

      }

      case 'hourglass': {

        // Sandglass Dual Teardrop Loop

        const theta = t * Math.PI * 2.8 - Math.PI * 0.5;

        const pinch = 0.58 + 0.42 * Math.abs(Math.sin(theta));

        const decay = 1.0 - t * 0.32;

        return {

          x: cx + rxMax * Math.cos(theta) * pinch * decay * 0.92,

          y: cy + ryMax * Math.sin(theta) * decay * 0.92,

        };

      }

      case 'spiral':

      default: {

        // Grand expansive oval spiral filling the canvas

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



export function SnakeTrackView({

  game,

  trackShape = 's_curve',

  viewWidth,

  viewHeight,

  activeUnravel,

  slotCoords,

}: Props) {

  // 1. Arc-Length Parameterized Track Engine:

  const lut = useMemo(

    () => createTrackLUT(trackShape, viewWidth, viewHeight),

    [trackShape, viewWidth, viewHeight],

  );



  // Alive breathing bob animation for the dragon head

  const headBreath = useRef(new Animated.Value(1)).current;



  useEffect(() => {

    const loop = Animated.loop(

      Animated.sequence([

        Animated.timing(headBreath, {

          toValue: 1.07,

          duration: 520,

          easing: Easing.inOut(Easing.sin),

          useNativeDriver: true,

        }),

        Animated.timing(headBreath, {

          toValue: 1.0,

          duration: 520,

          easing: Easing.inOut(Easing.sin),

          useNativeDriver: true,

        }),

      ]),

    );

    loop.start();

    return () => loop.stop();

  }, [headBreath]);



  // 2. Continuous 60 FPS Visual Interpolation Loop:

  // Glides the head smoothly at 60 FPS between state updates so movement never hitches or freezes!

  const visualHeadPos = useRef(game.headPos);

  const [, setFrameTick] = useState<number>(0);



  useEffect(() => {

    let animId: number;

    let running = true;



    const loop = () => {

      if (!running) return;

      const target = game.headPos;

      const diff = target - visualHeadPos.current;



      if (Math.abs(diff) > 0.005) {

        visualHeadPos.current += diff * 0.24;

        setFrameTick((t: number) => (t + 1) % 1000000);

      } else if (visualHeadPos.current !== target) {

        visualHeadPos.current = target;

        setFrameTick((t: number) => (t + 1) % 1000000);

      } else if (activeUnravel) {

        // Continuous 60 FPS animation loop while unraveling for dynamic wool fluttering!

        setFrameTick((t: number) => (t + 1) % 1000000);

      }

      animId = requestAnimationFrame(loop);

    };



    animId = requestAnimationFrame(loop);

    return () => {

      running = false;

      cancelAnimationFrame(animId);

    };

  }, [game.headPos, activeUnravel]);



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



  // Spacing: Fixed physical pixel distance between adjacent cable-knit rings!

  const ringSpacing = Math.max(16, jointSize * 0.52);



  const { rings, headPos, neckPos, headAngle } = useMemo(() => {

    const list: Array<{

      id: string;

      x: number;

      y: number;

      angle: number;

      color: string;

      scale: number;

    }> = [];



    // Map normalized headPos (0 to 100) to physical track distance in pixels:

    const headT = Math.min(0.97, Math.max(0.04, visualHeadPos.current / 100));

    const headDist = headT * lut.total;



    // Head sample:

    const headPt = lut.sample(headDist);



    // Dynamic wave phase tied to physical pixels slithered:

    const slitherPhase = headDist * 0.055;



    // Rings along the dragon's body:

    let ringIndex = 0;

    for (let sIdx = 0; sIdx < game.segments.length; sIdx++) {

      const seg = game.segments[sIdx];

      for (let unit = 0; unit < seg.units; unit++) {

        const ringDist = headDist - (ringIndex + 1) * ringSpacing;

        const sampleDist = Math.max(0, ringDist);

        const ringPt = lut.sample(sampleDist);



        // Organic transverse slither wave perpendicular to the path:

        const wave = Math.sin(slitherPhase - ringIndex * 0.48) * 3.2;

        const breath = 1.0 + Math.sin(slitherPhase * 1.5 - ringIndex * 0.35) * 0.035;



        // Taper / entrance scale if ring is still unfurling from spawn:

        const enterScale = ringDist < 0 ? Math.max(0, 1 + ringDist / ringSpacing) : 1.0;

        const isTaper = ringIndex === 0;

        const baseScale = isTaper ? 1.08 : 1.02;



        list.push({

          id: `${seg.color}_${sIdx}_${unit}`,

          x: ringPt.x + ringPt.nx * wave,

          y: ringPt.y + ringPt.ny * wave,

          angle: ringPt.angle,

          color: seg.color,

          scale: baseScale * breath * enterScale,

        });



        ringIndex++;

      }

    }



    // Forward direction & Head slither wave:

    const headWave = Math.sin(slitherPhase) * 2.2;

    const hPos = {

      x: headPt.x + headPt.nx * headWave,

      y: headPt.y + headPt.ny * headWave,

    };



    // Neck unravelling anchor point: strictly at collar behind head:

    const rad = (headPt.angle * Math.PI) / 180;

    const cosA = Math.cos(rad);

    const sinA = Math.sin(rad);

    const neckPos = {

      x: hPos.x - cosA * (headSize * 0.40),

      y: hPos.y - sinA * (headSize * 0.40),

    };



    // 100% Original Yumak Pop custom knitted creature sprite:

    // Natural 360-degree forward tracking, snout is aligned along 0°:

    const angle = headPt.angle;



    return {

      rings: list.reverse(), // render from tail to head so front rings overlap rear rings

      headPos: hPos,

      neckPos,

      headAngle: angle,

    };

  }, [visualHeadPos.current, game.segments, lut, jointSize, headSize, ringSpacing]);



  const targetSlot =

    activeUnravel && slotCoords[activeUnravel.spoolSlot]

      ? slotCoords[activeUnravel.spoolSlot]

      : null;



  const activeYarnColor = activeUnravel?.color ?? 'R';

  const yarnTheme = YARN[activeYarnColor] ?? YARN.R;



  return (

    <View style={[styles.container, { width: viewWidth, height: viewHeight }]} pointerEvents="box-none">

      {/* 1. Recessed Routered Wooden Canal into the Table (Natural wood shading, NO fake borders) */}

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

      </Svg>



      {/* 2. Photorealistic 3D Wicker Sewing Basket at Track Destination (Zero white halo) */}

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



      {/* 3. The 3D Interlocking Cable-Knit Rings (1-to-1 exact matching of spool units!) */}

      {rings.map((ring) => {

        const spriteSource = SPRITES[ring.color] ?? SPRITES.R;

        const curSize = jointSize * ring.scale;



        return (

          <View

            key={ring.id}

            style={[

              styles.jointWrap,

              {

                left: ring.x - curSize / 2,

                top: ring.y - curSize / 2,

                width: curSize,

                height: curSize,

                transform: [

                  { rotate: `${ring.angle.toFixed(1)}deg` },

                  { scale: ring.scale },

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

      })}



      {/* 4. Alive 3D Cable-Knit Dragon Head (Snout always faces path forward direction!) */}

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

        </Animated.View>

      )}



      {/* 5. Dynamic Live Unraveling Flying Wool Strand (Reaches directly into the spool, NO clipping!) */}

      {targetSlot && (

        <Svg

          width={viewWidth}

          height={Math.max(viewHeight + 450, targetSlot.y + 80)}

          style={[styles.unravelSvg, { width: viewWidth, height: Math.max(viewHeight + 450, targetSlot.y + 80) }]}

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



              // Normal vector perpendicular to the line:

              const nx = -dy / dist;

              const ny = dx / dist;



              // Natural outward elastic curve with subtle animated whip flutter:

              const now = Date.now();

              const flutter = Math.sin(now / 52) * 3.5;

              const side = dx >= 0 ? 1 : -1;

              const bow = side * Math.min(38, Math.max(16, dist * 0.15)) + flutter;



              const cpX = (x0 + x1) / 2 + nx * bow;

              const cpY = (y0 + y1) / 2 + ny * bow - 10;



              // High-fidelity knitted yarn crimp wave (Örgü Sökülme Dalgası):

              // As yarn unpicks from stitches, it retains its natural zigzag crimp memory.

              // Amplitude is higher near the collar (~3.2px) and pulls tauter near the spool (~0.8px).

              const N_SEG = 34;

              const crimpPhase = (now / 120) % (Math.PI * 2);

              const numWaves = Math.max(7, Math.min(18, dist / 24));

              const pts: { x: number; y: number }[] = [];



              for (let i = 0; i <= N_SEG; i++) {

                const t = i / N_SEG;

                const inv = 1 - t;

                // Base quadratic curve point

                const bx = inv * inv * x0 + 2 * inv * t * cpX + t * t * x1;

                const by = inv * inv * y0 + 2 * inv * t * cpY + t * t * y1;



                // Tangent vector

                const tx = 2 * inv * (cpX - x0) + 2 * t * (x1 - cpX);

                const ty = 2 * inv * (cpY - y0) + 2 * t * (y1 - cpY);

                const tLen = Math.hypot(tx, ty) || 1;

                const pnx = -ty / tLen;

                const pny = tx / tLen;



                // Crimp envelope: rises from collar, tapers as it winds onto spool

                const env = Math.sin(t * Math.PI) * Math.max(0.8, 3.2 * (1 - t * 0.55));

                const wave = Math.sin(t * numWaves * Math.PI * 2 - crimpPhase) * env;



                pts.push({

                  x: bx + pnx * wave,

                  y: by + pny * wave,

                });

              }



              // Smooth SVG yarn strand path

              let yarnD = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;

              for (let i = 1; i < pts.length; i++) {

                yarnD += ` L ${pts[i].x.toFixed(1)} ${pts[i].y.toFixed(1)}`;

              }



              return (

                <G>

                  {/* Soft cast shadow of unravelling wool thread onto table */}

                  <Path

                    d={yarnD}

                    stroke="rgba(25, 10, 4, 0.28)"

                    strokeWidth={4.8}

                    strokeLinecap="round"

                    strokeLinejoin="round"

                    fill="none"

                    transform="translate(0, 3)"

                  />

                  {/* Dark wool foundation core */}

                  <Path

                    d={yarnD}

                    stroke={yarnTheme.dark}

                    strokeWidth={4.0}

                    strokeLinecap="round"

                    strokeLinejoin="round"

                    fill="none"

                  />

                  {/* Vibrant exact-matching woolen strand */}

                  <Path

                    d={yarnD}

                    stroke="url(#woolCurlGrad)"

                    strokeWidth={2.8}

                    strokeLinecap="round"

                    strokeLinejoin="round"

                    fill="none"

                  />

                  {/* Tactile spun wool fiber highlight (twisted ply reflection) */}

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

                  {/* Second offset yarn twist texture */}

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



                  {/* Realistic yarn loop winding smoothly around the spool bobbin (NO floating circles!) */}

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

});

