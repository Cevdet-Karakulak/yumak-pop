import {
  canTap,
  cloneState,
  GameState,
  Spool,
  tapColumn,
  unravelTick,
  YarnSegment,
} from './engine';
import { createRng, Rng } from './rng';

export const TOTAL_LEVELS = 150;
export const BASE_RACK = 3;
export const LEVELS_PER_CHAPTER = 50;

export interface Chapter {
  id: number;
  title: string;
  subtitle: string;
  startLevel: number;
  endLevel: number;
  icon: string;
}

export const CHAPTERS: Chapter[] = [
  { id: 1, title: 'Atölye Başlangıcı', subtitle: 'İlk İlmekler ve Temeller', startLevel: 1, endLevel: 50, icon: '🧶' },
  { id: 2, title: 'Renkli Yumaklar', subtitle: 'Kelt Labirenti & İkiz Makaralar', startLevel: 51, endLevel: 100, icon: '🌈' },
  { id: 3, title: 'Sihirli İğneler', subtitle: 'Köprüler, Buz Alanları & Yürüyen Bant', startLevel: 101, endLevel: 150, icon: '✨' },
  { id: 4, title: 'Büyük Örgü Ustası', subtitle: 'Usta İşi Akrobatik Parkurlar', startLevel: 151, endLevel: 200, icon: '👑' },
  { id: 5, title: 'Gökkuşağı Vadisi', subtitle: 'Buzlu Bobinler ve İki Renkli İpler', startLevel: 201, endLevel: 250, icon: '🌸' },
  { id: 6, title: 'Efsanevi Motifler', subtitle: 'Büyük Usta Mücadeleleri', startLevel: 251, endLevel: 300, icon: '🏆' },
];

export function getActiveChapters(total = TOTAL_LEVELS): Chapter[] {
  const numChapters = Math.ceil(total / LEVELS_PER_CHAPTER);
  return CHAPTERS.slice(0, Math.max(1, numChapters));
}

export function getChapterForLevel(lvl: number): Chapter {
  return (
    CHAPTERS.find((c) => lvl >= c.startLevel && lvl <= c.endLevel) || {
      id: Math.ceil(lvl / LEVELS_PER_CHAPTER),
      title: `Bölüm Paketi ${Math.ceil(lvl / LEVELS_PER_CHAPTER)}`,
      subtitle: `${(Math.ceil(lvl / LEVELS_PER_CHAPTER) - 1) * LEVELS_PER_CHAPTER + 1} - ${Math.ceil(lvl / LEVELS_PER_CHAPTER) * LEVELS_PER_CHAPTER}`,
      startLevel: (Math.ceil(lvl / LEVELS_PER_CHAPTER) - 1) * LEVELS_PER_CHAPTER + 1,
      endLevel: Math.ceil(lvl / LEVELS_PER_CHAPTER) * LEVELS_PER_CHAPTER,
      icon: '🧵',
    }
  );
}

export type MechanicKind =
  | 'basic'
  | 'knots'
  | 'twin'
  | 'basket'
  | 'vortex'
  | 'mystery'
  | 'rainbow'
  | 'frozen'
  | 'dual'
  | 'bridge'
  | 'ice_zone'
  | 'conveyor';

export type TrackShape =
  | 'clover'
  | 'horseshoe'
  | 'labyrinth'
  | 'rollercoaster'
  | 'spiral'
  | 'infinity'
  | 'heart'
  | 'butterfly'
  | 'pretzel'
  | 'blossom'
  | 'zigzag_grand'
  | 'yin_yang'
  | 'diamond'
  | 'snail_shell'
  | 'guitar'
  | 'star_spiral'
  | 'serpentine_waves'
  | 'hourglass'
  | 's_curve'
  | 'bridge_cross'
  | 'frozen_fjord'
  | 'carousel_circus'
  | 'dragon_spiral'
  | 'escalator_zigzag'
  | 'celtic_nexus';

export interface LevelInfo {
  number: number;
  columns: number;
  rack: number;
  hard: boolean;
  trackShape: TrackShape;
  mechanics: MechanicKind[];
  newMechanic?: MechanicKind;
}

const COLOR_PALETTE = ['R', 'Y', 'T', 'B', 'O', 'P', 'G', 'K'];

function levelParams(n: number) {
  // Higher difficulty: from level 10 onwards, and especially Chapter 3 (101-150)!
  const hard = n >= 10 ? (n > 100 ? n % 6 !== 1 : n % 4 !== 1) : n >= 5 && (n % 5 === 0 || n % 7 === 0);
  const mechanics: MechanicKind[] = ['basic'];
  if (n >= 3) mechanics.push('knots');
  if (n >= 5) mechanics.push('twin');
  if (n >= 7) mechanics.push('basket');
  if (n >= 10) mechanics.push('mystery');
  if (n >= 16) mechanics.push('rainbow');
  if (n >= 24) mechanics.push('frozen');
  if (n >= 36) mechanics.push('dual');
  if (hard) mechanics.push('vortex');

  // Bridge / Tunnel obstacle:
  if (n >= 55 && (n % 4 === 3 || n % 4 === 0 || (n >= 101 && (n % 3 === 0 || n % 5 === 0)))) {
    mechanics.push('bridge');
  }
  // Ice Zone / Frozen Track:
  if (n >= 75 && (n % 5 === 2 || n % 4 === 2 || (n >= 101 && (n % 3 === 1 || n % 4 === 0)))) {
    mechanics.push('ice_zone');
  }
  // Conveyor / Moving Spool Belt:
  if (n >= 95 && (n % 5 === 4 || (n >= 101 && (n % 3 === 2 || n % 2 === 0)))) {
    mechanics.push('conveyor');
  }

  let newMechanic: MechanicKind | undefined;
  if (n === 1) newMechanic = 'basic';
  else if (n === 3) newMechanic = 'knots';
  else if (n === 5) newMechanic = 'twin';
  else if (n === 7) newMechanic = 'basket';
  else if (n === 10) newMechanic = 'mystery';
  else if (n === 16) newMechanic = 'rainbow';
  else if (n === 24) newMechanic = 'frozen';
  else if (n === 36) newMechanic = 'dual';
  else if (n === 55 || n === 101) newMechanic = 'bridge';
  else if (n === 75 || n === 103) newMechanic = 'ice_zone';
  else if (n === 95 || n === 105) newMechanic = 'conveyor';

  // Progressive color palette expansion (up to 8 colors)
  const numColors = Math.min(
    COLOR_PALETTE.length,
    n <= 2 ? 3 : n <= 5 ? 4 : n <= 9 ? 5 : n <= 18 ? 6 : n <= 35 ? 7 : (n > 100 ? (n > 125 ? 8 : (n % 2 === 0 ? 8 : 7)) : 8),
  );
  // Long, epic snake lengths across all levels (especially 10+)
  const totalSegments = Math.min(
    54,
    n <= 3
      ? 10 + n * 2
      : n <= 9
      ? 18 + Math.floor(n * 0.8)
      : n <= 20
      ? 26 + Math.floor(n * 0.5)
      : n <= 40
      ? 34 + Math.floor(n * 0.45)
      : n <= 70
      ? 42 + Math.floor((n - 40) * 0.25)
      : n <= 100
      ? 50 + Math.floor((n - 70) * 0.15)
      : 48 + Math.floor((n - 100) * 0.12),
  );
  const segmentLength = n <= 3 ? 4 : n <= 8 ? 4 : 5;

  const TRACK_ORDER: TrackShape[] = [
    'clover',
    'horseshoe',
    'labyrinth',
    'rollercoaster',
    'spiral',
    'infinity',
    'heart',
    'butterfly',
    'pretzel',
    'blossom',
    'zigzag_grand',
    'yin_yang',
    'diamond',
    'snail_shell',
    'guitar',
    'star_spiral',
    'serpentine_waves',
    'hourglass',
    'bridge_cross',
    'frozen_fjord',
    'carousel_circus',
    'dragon_spiral',
    'escalator_zigzag',
    'celtic_nexus',
  ];

  let trackShape: TrackShape;
  if (n > 100) {
    const ch3Tracks: TrackShape[] = [
      'bridge_cross',
      'frozen_fjord',
      'carousel_circus',
      'dragon_spiral',
      'escalator_zigzag',
      'celtic_nexus',
      'labyrinth',
      'rollercoaster',
      'pretzel',
      'star_spiral',
    ];
    trackShape = ch3Tracks[(n - 101) % ch3Tracks.length];
  } else {
    trackShape = TRACK_ORDER[(n - 1) % TRACK_ORDER.length];
  }

  const basketRatio = n < 7 ? 0 : n <= 15 ? 0.20 : 0.26;
  const stepPenalty = n > 100
    ? Math.min(3.2, 2.3 + ((n - 100) / 50) * 0.9)
    : (hard ? 2.0 : n <= 3 ? 1.2 : n <= 9 ? 1.4 : 1.7);
  const startHeadPos = n > 100
    ? Math.min(38, 30 + Math.floor(((n - 100) / 50) * 8))
    : (n <= 3 ? 20 : hard ? 30 : 24);

  const mysteryCount = n < 10 ? 0 : n <= 20 ? 1 : n <= 40 ? 2 : (n > 100 ? (n > 125 ? 4 : 3) : 3);
  const wildCount = n < 16 ? 0 : (n % 3 === 0 || n % 5 === 0 ? 1 : 0);
  const frozenCount = n < 24 ? 0 : n <= 45 ? 1 : (n > 100 ? 3 : 2);
  const dualCount = n < 36 ? 0 : n <= 65 ? 1 : (n > 100 ? 3 : 2);

  const hasBridge = mechanics.includes('bridge') || trackShape === 'bridge_cross';
  const hasIce = mechanics.includes('ice_zone') || trackShape === 'frozen_fjord';
  const hasConveyor = mechanics.includes('conveyor') || trackShape === 'carousel_circus' || trackShape === 'escalator_zigzag';

  const bridge = hasBridge
    ? { start: 42 + (n % 8), end: 54 + (n % 8) }
    : undefined;

  const iceZone = hasIce
    ? { start: 64 + (n % 6), end: 76 + (n % 6) }
    : undefined;

  const conveyor = hasConveyor
    ? {
        active: true,
        interval: n > 130 ? 2 : 3,
        movesUntilShift: n > 130 ? 2 : 3,
        direction: (n % 2 === 0 ? 1 : -1) as (1 | -1),
      }
    : undefined;

  return {
    numColors,
    totalSegments,
    segmentLength,
    columns: n <= 3 ? 4 : 5,
    knotCount: n < 3 ? 0 : n <= 6 ? 2 : n <= 12 ? 3 : n <= 25 ? 4 : 5,
    twinPairs: n < 5 ? 0 : n <= 12 ? 1 : n <= 25 ? 2 : 2,
    mysteryCount,
    wildCount,
    frozenCount,
    dualCount,
    basketRatio,
    stepPenalty,
    startHeadPos,
    trackShape,
    hard,
    mechanics,
    newMechanic,
    bridge,
    iceZone,
    conveyor,
  };
}

export function getLevelInfo(n: number): LevelInfo {
  const p = levelParams(n);
  return {
    number: n,
    columns: p.columns,
    rack: BASE_RACK,
    hard: p.hard,
    trackShape: p.trackShape,
    mechanics: p.mechanics,
    newMechanic: p.newMechanic,
  };
}

/**
 * Creates a Zuma-Yarn level with a snake of yarn segments on a track,
 * and sets up matching spools with guaranteed solvability!
 */
export function createLevel(n: number, rackSlots = BASE_RACK): GameState {
  const p = levelParams(n);

  for (let attempt = 0; attempt < 24; attempt++) {
    const rng = createRng(n * 1337 + attempt * 7919 + 42);

    const colors = COLOR_PALETTE.slice(0, p.numColors);
    const segments: YarnSegment[] = [];
    const spoolPool: { color: string; cap: number }[] = [];

    let segId = 1;
    let lastColor = '';

    const possibleUnits = n <= 2 ? [3, 4] : [3, 4, 5];

    for (let i = 0; i < p.totalSegments; i++) {
      const available = colors.filter((c) => c !== lastColor);
      const color = rng.pick(available.length ? available : colors);
      lastColor = color;

      const units = rng.pick(possibleUnits);
      segments.push({
        id: segId++,
        color,
        units,
        maxUnits: units,
      });

      // Diverse spool capacities (2, 3, 4, 5) matching varied segment lengths
      if (units >= 5 && rng.next() < 0.30) {
        const u1 = Math.floor(units / 2);
        const u2 = units - u1;
        spoolPool.push({ color, cap: u1 });
        spoolPool.push({ color, cap: u2 });
      } else {
        spoolPool.push({ color, cap: units });
      }
    }

    const totalUnits = segments.reduce((sum, s) => sum + s.units, 0);

    const colCount = p.columns;
    const columns: Spool[][] = Array.from({ length: colCount }, () => []);
    const baskets: Spool[][] = Array.from({ length: colCount }, () => []);

    let spoolId = 1;
    const orderedSpools = spoolPool.map((sp) => ({
      id: spoolId++,
      color: sp.color,
      cap: sp.cap,
      need: sp.cap,
      hidden: false,
      knots: 0,
    }));

    // Distribute across columns
    orderedSpools.forEach((spool, idx) => {
      const c = idx % colCount;
      columns[c].push(spool);
    });

    // Apply Knots to deeper spools
    const actualKnots = Math.max(0, p.knotCount - Math.floor(attempt / 4));
    if (actualKnots > 0) {
      let applied = 0;
      for (let c = 1; c < colCount && applied < actualKnots; c++) {
        if (columns[c].length > 1) {
          columns[c][1].knots = 1;
          applied++;
        }
      }
    }

    // Apply Twin Links
    const actualTwins = Math.max(0, p.twinPairs - Math.floor(attempt / 6));
    if (actualTwins > 0) {
      let twinId = 1;
      for (let c = 0; c < colCount && twinId <= actualTwins; c++) {
        if (columns[c].length >= 2) {
          columns[c][0].twinId = twinId;
          columns[c][1].twinId = twinId;
          twinId++;
        }
      }
    }

    // Apply Mystery spools (deeper in columns, e.g. index >= 2)
    if (p.mysteryCount > 0) {
      let applied = 0;
      for (let c = 0; c < colCount && applied < p.mysteryCount; c++) {
        if (columns[c].length >= 3 && !columns[c][2].twinId) {
          columns[c][2].isMystery = true;
          applied++;
        }
      }
    }

    // Apply Rainbow Wild Spool (gives player tactical escape from deadlocks!)
    if (p.wildCount > 0) {
      for (let c = 0; c < colCount; c++) {
        const target = columns[c].find((s, idx) => idx >= 1 && !s.knots && !s.twinId && !s.isMystery);
        if (target) {
          target.isWild = true;
          break;
        }
      }
    }

    // Apply Frozen spools (deeper spools encased in ice, thawed by rack pops)
    if (p.frozenCount > 0) {
      let applied = 0;
      for (let c = colCount - 1; c >= 0 && applied < p.frozenCount; c--) {
        const target = columns[c].find((s, idx) => idx >= 1 && !s.knots && !s.twinId && !s.isWild && !s.isMystery);
        if (target) {
          target.frozen = 1;
          applied++;
        }
      }
    }

    // Apply Dual-Layer spools (outer layer finishes -> reveals second inner color)
    if (p.dualCount > 0) {
      let applied = 0;
      for (let c = 0; c < colCount && applied < p.dualCount; c++) {
        if (columns[c].length >= 4) {
          const lastIdx = columns[c].length - 1;
          const sp1 = columns[c][lastIdx - 1];
          const sp2 = columns[c][lastIdx];
          if (!sp1.twinId && !sp2.twinId && !sp1.isWild && !sp2.isWild && !sp1.frozen && !sp2.frozen) {
            sp1.secondColor = sp2.color;
            sp1.secondCap = sp2.cap;
            columns[c].splice(lastIdx, 1);
            applied++;
          }
        }
      }
    }

    // Move back-line spools to Baskets
    if (p.basketRatio > 0) {
      for (let c = 0; c < colCount; c++) {
        const keep = Math.max(2, Math.floor(columns[c].length * (1 - p.basketRatio)));
        if (columns[c].length > keep) {
          baskets[c] = columns[c].splice(keep);
        }
      }
    }

    const candidate: GameState = {
      trackLength: 100,
      headPos: Math.max(16, p.startHeadPos - attempt * 1.5),
      dangerHolePos: 100,
      segments,
      columns,
      baskets,
      rack: new Array(rackSlots).fill(null),
      remainingUnits: totalUnits,
      totalUnits,
      moves: 0,
      stepPenalty: Math.max(1.5, p.stepPenalty - attempt * 0.1),
      status: 'playing',
      bridge: p.bridge,
      iceZone: p.iceZone,
      conveyor: p.conveyor,
    };

    if (isLevelSolvable(candidate, 400)) {
      return candidate;
    }
  }

  // Guaranteed fallback
  const colors = COLOR_PALETTE.slice(0, p.numColors);
  const segments: YarnSegment[] = [];
  const spoolPool: { color: string; cap: number }[] = [];
  let segId = 1;
  for (let i = 0; i < p.totalSegments; i++) {
    const color = colors[i % colors.length];
    segments.push({ id: segId++, color, units: p.segmentLength, maxUnits: p.segmentLength });
    spoolPool.push({ color, cap: p.segmentLength });
  }
  const colCount = p.columns;
  const columns: Spool[][] = Array.from({ length: colCount }, () => []);
  let spoolId = 1;
  spoolPool.forEach((sp, idx) => {
    columns[idx % colCount].push({
      id: spoolId++,
      color: sp.color,
      cap: sp.cap,
      need: sp.cap,
      hidden: false,
      knots: 0,
    });
  });
  return {
    trackLength: 100,
    headPos: 25,
    dangerHolePos: 100,
    segments,
    columns,
    baskets: Array.from({ length: colCount }, () => []),
    rack: new Array(rackSlots).fill(null),
    remainingUnits: segments.reduce((sum, s) => sum + s.units, 0),
    totalUnits: segments.reduce((sum, s) => sum + s.units, 0),
    moves: 0,
    stepPenalty: 2.2,
    status: 'playing',
    bridge: p.bridge,
    iceZone: p.iceZone,
    conveyor: p.conveyor,
  };
}

/**
 * Checks if the level can be solved with current setup.
 */
export function isLevelSolvable(start: GameState, maxSteps = 450): boolean {
  let s = cloneState(start);
  for (let step = 0; step < maxSteps; step++) {
    // Run unraveling until settled
    for (let g = 0; g < 40; g++) {
      const res = unravelTick(s);
      s = res.state;
      if (!res.tickInfo) break;
    }
    if (s.status === 'won') return true;
    if (s.status === 'lost') return false;

    // Smart priority:
    // 1. First choice: Front spool that matches head color OR is Wild!
    const headColor = s.segments[0]?.color;
    let chosenCol = s.columns.findIndex(
      (_, idx) =>
        canTap(s, idx) &&
        (s.columns[idx][0]?.color === headColor || s.columns[idx][0]?.isWild),
    );

    // 2. Second choice: Next segment color in snake
    if (chosenCol < 0 && s.segments.length > 1) {
      const nextColor = s.segments[1]?.color;
      chosenCol = s.columns.findIndex(
        (_, idx) =>
          canTap(s, idx) &&
          (s.columns[idx][0]?.color === nextColor || s.columns[idx][0]?.isWild),
      );
    }

    // 3. Fallback: Any valid move
    if (chosenCol < 0) {
      chosenCol = s.columns.findIndex((_, idx) => canTap(s, idx));
    }
    if (chosenCol < 0) return false;

    const tapRes = tapColumn(s, chosenCol);
    if (!tapRes) return false;
    s = tapRes.state;
  }
  return s.status === 'won';
}
