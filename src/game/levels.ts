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

export const TOTAL_LEVELS = 200;
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
  { id: 4, title: 'Kış Zirvesi & Dağ Parkurları', subtitle: 'Buzlu Fiyortlar, Çift Başlı Yılanlar & Zirve Sınavı', startLevel: 151, endLevel: 200, icon: '🏔️' },
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
    n === 1 ? 3 : n <= 4 ? 5 : n <= 9 ? 5 : n <= 18 ? 6 : n <= 35 ? 7 : (n > 100 ? (n > 125 ? 8 : (n % 2 === 0 ? 8 : 7)) : 8),
  );
  // Long, epic snake lengths across all levels (especially 10+)
  const totalSegments = Math.min(
    54,
    n === 1
      ? 14
      : n <= 4
      ? 16 + n * 2
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

  if (hasBridge && !mechanics.includes('bridge')) mechanics.push('bridge');
  if (hasIce && !mechanics.includes('ice_zone')) mechanics.push('ice_zone');
  if (hasConveyor && !mechanics.includes('conveyor')) mechanics.push('conveyor');

  if (!newMechanic) {
    if (n === 19 && hasBridge) newMechanic = 'bridge';
    else if (n === 20 && hasIce) newMechanic = 'ice_zone';
    else if (n === 21 && hasConveyor) newMechanic = 'conveyor';
  }

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
    columns: n === 1 ? 4 : 5,
    knotCount: n === 1 ? 0 : n <= 6 ? 2 : n <= 12 ? 3 : n <= 25 ? 4 : 5,
    twinPairs: n < 2 ? 0 : n <= 12 ? 1 : n <= 25 ? 2 : 2,
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
export function createLevel(n: number, rackSlots = BASE_RACK, seedSalt = 0): GameState {
  const p = levelParams(n);

  for (let attempt = 0; attempt < 160; attempt++) {
    const rng = createRng(n * 1337 + attempt * 7919 + 42 + seedSalt * 104729);

    const colors = COLOR_PALETTE.slice(0, p.numColors);
    const segments: YarnSegment[] = [];
    const spoolPool: { color: string; cap: number }[] = [];

    let segId = 1;
    let lastColor = '';

    const possibleUnits = n <= 4 ? [3, 4, 5] : [3, 4, 5, 6];

    for (let i = 0; i < p.totalSegments; i++) {
      const available = colors.filter((c) => c !== lastColor);
      const color = rng.pick(available.length ? available : colors);
      lastColor = color;

      // Ensure at least two different segment lengths even on small levels
      const units =
        i === 0
          ? possibleUnits[0]
          : i === 1
          ? possibleUnits[possibleUnits.length - 1]
          : rng.pick(possibleUnits);
      segments.push({
        id: segId++,
        color,
        units,
        maxUnits: units,
      });

      // Always generate diverse spool capacities (2, 3, 4, 5) so no level is monotonous
      // For early attempts (0..24), split ~40% of 5- and 6-unit segments into pairs.
      // For later attempts (25+), use single spools with varied capacities [3, 4, 5] so the 3-slot rack doesn't jam on split pairs!
      const allowSplit = attempt < 25;
      if (units === 6) {
        if (allowSplit) {
          if (rng.next() < 0.5) {
            spoolPool.push({ color, cap: 2 }, { color, cap: 4 });
          } else {
            spoolPool.push({ color, cap: 3 }, { color, cap: 3 });
          }
        } else {
          segments[segments.length - 1].units = 5;
          segments[segments.length - 1].maxUnits = 5;
          spoolPool.push({ color, cap: 5 });
        }
      } else if (units === 5 && allowSplit && (rng.next() < 0.35 || i === 2)) {
        if (rng.next() < 0.5) {
          spoolPool.push({ color, cap: 2 }, { color, cap: 3 });
        } else {
          spoolPool.push({ color, cap: 3 }, { color, cap: 2 });
        }
      } else if (units === 4 && allowSplit && (rng.next() < 0.20 || i === 1)) {
        spoolPool.push({ color, cap: 2 }, { color, cap: 2 });
      } else {
        spoolPool.push({ color, cap: units });
      }
    }

    const totalUnits = segments.reduce((sum, s) => sum + s.units, 0);

    const colCount = p.columns;
    const columns: Spool[][] = Array.from({ length: colCount }, () => []);
    const baskets: Spool[][] = Array.from({ length: colCount }, () => []);

    let spoolId = 1;
    const orderedSpools: Spool[] = spoolPool.map((sp) => ({
      id: spoolId++,
      color: sp.color,
      cap: sp.cap,
      need: sp.cap,
      hidden: false,
      knots: 0,
    }));

    // Permute spools within sliding windows and assign to randomized column permutations
    // so they are NEVER in left-to-right round-robin order (0, 1, 2, 3, 4...)!
    const windowSize = colCount;
    const windowedSpools: Spool[] = [];
    for (let i = 0; i < orderedSpools.length; i += windowSize) {
      const chunk = orderedSpools.slice(i, i + windowSize);
      if (chunk.length > 1) {
        let tries = 0;
        const origIds = chunk.map((x) => x.id).join(',');
        do {
          rng.shuffle(chunk);
          tries++;
        } while (tries < 6 && chunk.map((x) => x.id).join(',') === origIds);
      }
      windowedSpools.push(...chunk);
    }

    // Deal into columns using shuffled column indices per row, avoiding round-robin
    for (let i = 0; i < windowedSpools.length; i += colCount) {
      const rowCols = Array.from({ length: colCount }, (_, idx) => idx);
      rng.shuffle(rowCols);
      if (rowCols.every((v, idx) => v === idx) && colCount >= 2) {
        const tmp = rowCols[0];
        rowCols[0] = rowCols[colCount - 1];
        rowCols[colCount - 1] = tmp;
      }
      for (let j = 0; j < colCount && i + j < windowedSpools.length; j++) {
        columns[rowCols[j]].push(windowedSpools[i + j]);
      }
    }

    // Apply Knots to deeper spools (never lock the spool that matches segments[0] or segments[1] on later attempts)
    const actualKnots = p.knotCount > 0 ? Math.max(1, p.knotCount - Math.floor(attempt / 16)) : 0;
    if (actualKnots > 0) {
      let applied = 0;
      const knotCols = Array.from({ length: colCount }, (_, idx) => idx);
      rng.shuffle(knotCols);
      for (const c of knotCols) {
        if (applied >= actualKnots) break;
        const depthIdx = attempt > 20 && columns[c].length > 2 ? 2 : 1;
        if (
          columns[c].length > depthIdx &&
          (attempt < 20 || columns[c][depthIdx].color !== segments[0]?.color)
        ) {
          columns[c][depthIdx].knots = 1;
          applied++;
        }
      }
    }

    // Apply Twin Links (only when safe so 3-slot rack doesn't insta-jam)
    const actualTwins = p.twinPairs > 0 ? (attempt > 35 ? 1 : Math.max(1, p.twinPairs - Math.floor(attempt / 16))) : 0;
    if (actualTwins > 0) {
      let twinId = 1;
      const twinCols = Array.from({ length: colCount }, (_, idx) => idx);
      rng.shuffle(twinCols);
      for (const c of twinCols) {
        if (twinId > actualTwins) break;
        const startIdx = attempt > 15 && columns[c].length >= 4 ? 2 : attempt > 4 && columns[c].length >= 3 ? 1 : 0;
        if (
          columns[c].length >= startIdx + 2 &&
          !columns[c][startIdx].knots &&
          !columns[c][startIdx + 1].knots
        ) {
          columns[c][startIdx].twinId = twinId;
          columns[c][startIdx + 1].twinId = twinId;
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

    // Apply Rainbow Wild Spools (gives player tactical escape from deadlocks!)
    const effectiveWildCount = attempt > 35 ? 2 : attempt > 12 ? Math.max(1, p.wildCount) : p.wildCount;
    if (effectiveWildCount > 0) {
      let applied = 0;
      for (let c = 0; c < colCount && applied < effectiveWildCount; c++) {
        const target = columns[c].find((s, idx) => idx >= 1 && !s.knots && !s.twinId && !s.isMystery && !s.isWild);
        if (target) {
          target.isWild = true;
          applied++;
        }
      }
    }

    // Apply Frozen spools (deeper spools encased in ice, thawed by rack pops)
    const actualFrozen = p.frozenCount > 0 ? (attempt > 30 ? 0 : Math.max(1, p.frozenCount - Math.floor(attempt / 15))) : 0;
    if (actualFrozen > 0) {
      let applied = 0;
      for (let c = colCount - 1; c >= 0 && applied < actualFrozen; c--) {
        const target = columns[c].find((s, idx) => idx >= 2 && !s.knots && !s.twinId && !s.isWild && !s.isMystery);
        if (target) {
          target.frozen = 1;
          applied++;
        }
      }
    }

    // Apply Dual-Layer spools (outer layer finishes -> reveals second inner color)
    const actualDual = p.dualCount > 0 ? (attempt > 25 ? 0 : Math.max(1, p.dualCount - Math.floor(attempt / 12))) : 0;
    if (actualDual > 0) {
      let applied = 0;
      for (let c = 0; c < colCount && applied < actualDual; c++) {
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
        const keep = Math.max(3, Math.floor(columns[c].length * (1 - p.basketRatio)));
        if (columns[c].length > keep) {
          baskets[c] = columns[c].splice(keep);
        }
      }
    }

    const candidate: GameState = {
      trackLength: 100,
      headPos: Math.max(10, p.startHeadPos - Math.floor(attempt / 4) * 1.2),
      dangerHolePos: 100,
      segments,
      columns,
      baskets,
      rack: new Array(rackSlots).fill(null),
      remainingUnits: totalUnits,
      totalUnits,
      moves: 0,
      stepPenalty: Math.max(1.0, p.stepPenalty - Math.floor(attempt / 5) * 0.08),
      status: 'playing',
      bridge: p.bridge,
      iceZone: p.iceZone,
      conveyor: p.conveyor,
    };

    // Must NOT be trivially solvable by mindless left-to-right or right-to-left tapping,
    // and MUST be solvable by smart lookahead!
    const maxSeqCleared = n <= 4 ? 0.85 : 0.65;
    if (
      (n <= 1 || !isTriviallySolvedSequentially(candidate, maxSeqCleared)) &&
      isLevelSolvable(candidate, 500)
    ) {
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
 * Dynamic difficulty assist: after repeated failures on the same level the
 * snake starts further from the hole and creeps slower. Only ever makes a
 * level easier, so solvability guarantees from createLevel still hold.
 */
export const ASSIST_THRESHOLD = 3;
export function assistTier(fails: number): 0 | 1 | 2 {
  if (fails >= ASSIST_THRESHOLD * 2) return 2;
  if (fails >= ASSIST_THRESHOLD) return 1;
  return 0;
}
export function applyAssist(s: GameState, fails: number): GameState {
  const tier = assistTier(fails);
  if (tier === 0) return s;
  return {
    ...s,
    headPos: Math.max(8, s.headPos - 8 * tier),
    stepPenalty: Math.max(1.2, s.stepPenalty * (tier === 2 ? 0.75 : 0.87)),
  };
}

/** Day number since epoch (local), used to seed the daily puzzle. */
export function dayIndex(d: Date = new Date()): number {
  const local = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
  return Math.floor(local / 86400000);
}

/**
 * Daily puzzle: re-uses a level's ruleset near the player's progress but with a
 * fresh, date-based layout seed so it is a brand-new board every day.
 */
export function getDailyLevel(unlocked: number, d: Date = new Date()): { base: number; salt: number } {
  const di = dayIndex(d);
  const lo = Math.max(6, Math.min(unlocked, TOTAL_LEVELS) - 6);
  const hi = Math.max(lo, Math.min(TOTAL_LEVELS, unlocked + 4));
  const span = hi - lo + 1;
  const base = lo + (((di * 37) % span) + span) % span;
  return { base, salt: (di % 9973) + 1 };
}

/**
 * Checks whether tapping columns in a mindless sequential pattern
 * (left-to-right 0,1,2,3,4... or right-to-left 4,3,2,1,0...) solves the level!
 * Also checks that the initial front row of spools does not match the first
 * N snake segments in left-to-right or right-to-left order.
 */
export function isTriviallySolvedSequentially(start: GameState, maxClearedRatio = 0.65): boolean {
  const colCount = start.columns.length;

  // 1. Check if the top row of spools is in direct 0,1,2.. or N-1..0 order matching snake segments
  const frontColors = start.columns.map((c) => c[0]?.color ?? '');
  const segColors = start.segments.slice(0, colCount).map((s) => s.color);
  if (segColors.length >= 3) {
    const matchL2R = segColors.slice(0, 3).every((c, i) => frontColors[i] === c);
    const matchR2L = segColors.slice(0, 3).every((c, i) => frontColors[colCount - 1 - i] === c);
    if (matchL2R || matchR2L) return true;
  }

  // 2. Simulate a mindless bot tapping left-to-right or right-to-left
  for (const dir of [1, -1]) {
    let s = cloneState(start);
    let cursor = dir === 1 ? 0 : colCount - 1;
    for (let step = 0; step < 300; step++) {
      for (let g = 0; g < 40; g++) {
        const res = unravelTick(s);
        s = res.state;
        if (!res.tickInfo) break;
      }
      if (s.status === 'won') return true;
      if (s.status === 'lost') break;

      let chosenCol = -1;
      for (let k = 0; k < colCount; k++) {
        const idx = ((cursor + k * dir) % colCount + colCount) % colCount;
        if (canTap(s, idx)) {
          chosenCol = idx;
          cursor = ((idx + dir) % colCount + colCount) % colCount;
          break;
        }
      }
      if (chosenCol < 0) break;
      const tapRes = tapColumn(s, chosenCol);
      if (!tapRes) break;
      s = tapRes.state;
    }
    const clearedRatio =
      start.totalUnits > 0 ? (start.totalUnits - s.remainingUnits) / start.totalUnits : 0;
    if (s.status === 'won' || clearedRatio > maxClearedRatio) {
      return true;
    }
  }
  return false;
}

/**
 * Evaluates a board state after unraveling settles (higher is better).
 */
function evaluateState(s: GameState): number {
  if (s.status === 'won') return 1e9;
  if (s.status === 'lost') return -1e9;
  const freeSlots = s.rack.filter((r) => r === null).length;
  const unlockedRatio = (s.totalUnits - s.remainingUnits) * 25;
  const safety = (s.dangerHolePos - s.headPos) * 4;
  return unlockedRatio + freeSlots * 140 + safety;
}

function settleState(start: GameState): GameState {
  let s = cloneState(start);
  for (let g = 0; g < 40; g++) {
    const res = unravelTick(s);
    s = res.state;
    if (!res.tickInfo) break;
  }
  return s;
}

/**
 * Checks if the level can be solved with current setup using 2-step lookahead heuristics.
 */
export function isLevelSolvable(start: GameState, maxSteps = 450): boolean {
  let s = settleState(start);
  for (let step = 0; step < maxSteps; step++) {
    if (s.status === 'won') return true;
    if (s.status === 'lost') return false;

    const colCount = s.columns.length;
    let bestNextState: GameState | null = null;
    let bestScore = -1e12;

    for (let c1 = 0; c1 < colCount; c1++) {
      if (!canTap(s, c1)) continue;
      const r1 = tapColumn(s, c1);
      if (!r1) continue;
      const s1 = settleState(r1.state);
      if (s1.status === 'won') return true;
      if (s1.status === 'lost') continue;

      let localBest = evaluateState(s1);
      const head1 = s1.segments[0]?.color;

      // 1-step lookahead into the next move (c2)
      for (let c2 = 0; c2 < colCount; c2++) {
        if (!canTap(s1, c2)) continue;
        const front2 = s1.columns[c2][0];
        if (!front2) continue;
        // Fast check: if c2 matches head1 or is wild, simulate it to see the big pop
        if (front2.color === head1 || front2.isWild || s1.rack.filter((r) => r === null).length >= 2) {
          const r2 = tapColumn(s1, c2);
          if (r2) {
            const s2 = settleState(r2.state);
            if (s2.status === 'won') return true;
            const sc2 = evaluateState(s2) + 80;
            if (sc2 > localBest) localBest = sc2;
          }
        }
      }

      if (localBest > bestScore) {
        bestScore = localBest;
        bestNextState = s1;
      }
    }

    if (!bestNextState) return false;
    s = bestNextState;
  }
  return s.status === 'won';
}
