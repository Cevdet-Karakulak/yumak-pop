/**
 * Core Zuma-Yarn Puzzle Engine for Yumak Pop.
 *
 * Concepts:
 * - A continuous knitted yarn snake (made of colored braided sections) moves along
 *   a winding carved track towards a vortex hole/basket at the end.
 * - STEP-BASED: The snake advances towards the hole with every move (or ticking step),
 *   giving a strategic puzzle vibe with imminent danger.
 * - UNRAVELING: When a spool on the rack matches the front segment of the snake,
 *   the yarn is pulled live, fiber by fiber, shrinking the snake while winding the spool!
 * - If the snake's head reaches the vortex hole -> LOST.
 * - If all yarn is completely unraveled -> WON.
 */

export interface YarnSegment {
  id: number;
  color: string; // YARN key
  units: number; // how many stitch units long this colored section is
  maxUnits: number;
}

export interface Spool {
  id: number;
  color: string;
  cap: number;
  need: number;
  hidden: boolean;
  knots: number;
  twinId?: number;
  isWild?: boolean;
  frozen?: number;
  isMystery?: boolean;
  secondColor?: string;
  secondCap?: number;
}

export type TapFailReason =
  | 'empty'
  | 'knotted'
  | 'frozen'
  | 'twin_needs_2_slots'
  | 'twin_partner_blocked'
  | 'rack_full';

export interface BridgeZone {
  start: number; // e.g. 42 (normalized 0..100)
  end: number;   // e.g. 56
}

export interface IceZone {
  start: number; // e.g. 64 (normalized 0..100)
  end: number;   // e.g. 78
  thawDuration?: number; // turns remaining thawed by a rack spool pop
}

export interface ConveyorConfig {
  active: boolean;
  interval: number; // shifts every X moves (e.g. 3)
  movesUntilShift: number; // countdown
  direction: 1 | -1;
}

export interface GameState {
  trackLength: number; // Normalized total length (e.g. 100)
  headPos: number; // 0..100 (100 = vortex hole)
  dangerHolePos: number; // 100
  segments: YarnSegment[]; // Front segment is at index 0 (closest to head)
  columns: Spool[][];
  baskets: Spool[][];
  rack: (Spool | null)[];
  remainingUnits: number;
  totalUnits: number;
  moves: number;
  stepPenalty: number; // how much the snake creeps forward on a move (e.g. 3.5)
  status: 'playing' | 'won' | 'lost';
  bridge?: BridgeZone;
  iceZone?: IceZone;
  conveyor?: ConveyorConfig;
}

export interface UnravelTick {
  spoolSlot: number;
  color: string;
  amount: number;
  snakeHeadPos: number;
  popped: boolean;
}

export function cloneState(s: GameState): GameState {
  return {
    ...s,
    segments: s.segments.map((seg) => ({ ...seg })),
    columns: s.columns.map((c) => c.map((sp) => ({ ...sp }))),
    baskets: s.baskets.map((b) => b.map((sp) => ({ ...sp }))),
    rack: s.rack.map((sp) => (sp ? { ...sp } : null)),
    bridge: s.bridge ? { ...s.bridge } : undefined,
    iceZone: s.iceZone ? { ...s.iceZone } : undefined,
    conveyor: s.conveyor ? { ...s.conveyor } : undefined,
  };
}

export function checkTap(s: GameState, col: number): { ok: true } | { ok: false; reason: TapFailReason } {
  if (s.status !== 'playing' || !s.columns[col] || s.columns[col].length === 0) {
    return { ok: false, reason: 'empty' };
  }
  const front = s.columns[col][0];
  if (front.knots > 0) {
    return { ok: false, reason: 'knotted' };
  }
  if (front.frozen && front.frozen > 0) {
    return { ok: false, reason: 'frozen' };
  }
  const freeSlots = s.rack.filter((r) => r === null).length;
  if (freeSlots === 0) {
    return { ok: false, reason: 'rack_full' };
  }
  if (front.twinId) {
    const partner = findTwinPartner(s, col, front);
    if (partner) {
      if (partner.spool.knots > 0) return { ok: false, reason: 'twin_partner_blocked' };
      if (partner.spool.frozen && partner.spool.frozen > 0) return { ok: false, reason: 'frozen' };
      if (freeSlots < 2) return { ok: false, reason: 'twin_needs_2_slots' };
    }
  }
  return { ok: true };
}

export function canTap(s: GameState, col: number): boolean {
  return checkTap(s, col).ok;
}

function findTwinPartner(s: GameState, col: number, sp: Spool) {
  if (!sp.twinId) return null;
  if (s.columns[col][1]?.twinId === sp.twinId) {
    return { col, idx: 1, spool: s.columns[col][1] };
  }
  for (let c = 0; c < s.columns.length; c++) {
    if (c === col) continue;
    if (s.columns[c][0]?.twinId === sp.twinId) {
      return { col: c, idx: 0, spool: s.columns[c][0] };
    }
  }
  return null;
}

function dispenseFromBasket(next: GameState, col: number) {
  if (next.baskets[col] && next.baskets[col].length > 0) {
    const emerged = next.baskets[col].shift()!;
    emerged.hidden = false;
    next.columns[col].push(emerged);
  }
  if (next.columns[col][0]) {
    next.columns[col][0].hidden = false;
  }
}

function untieAdjacentKnots(next: GameState, col: number): number[] {
  const untied: number[] = [];
  for (const adj of [col - 1, col + 1]) {
    const front = next.columns[adj]?.[0];
    if (front && front.knots > 0) {
      front.knots = Math.max(0, front.knots - 1);
      untied.push(adj);
    }
  }
  return untied;
}

function thawFrozenSpools(next: GameState) {
  for (const col of next.columns) {
    for (const sp of col) {
      if (sp.frozen && sp.frozen > 0) {
        sp.frozen -= 1;
      }
    }
  }
  for (const b of next.baskets) {
    for (const sp of b) {
      if (sp.frozen && sp.frozen > 0) {
        sp.frozen -= 1;
      }
    }
  }
}

export function shiftConveyor(next: GameState) {
  if (!next.columns || next.columns.length <= 1) return;
  const dir = next.conveyor?.direction ?? 1;
  if (dir > 0) {
    const lastCol = next.columns.pop()!;
    next.columns.unshift(lastCol);
    if (next.baskets && next.baskets.length === next.columns.length) {
      const lastB = next.baskets.pop()!;
      next.baskets.unshift(lastB);
    }
  } else {
    const firstCol = next.columns.shift()!;
    next.columns.push(firstCol);
    if (next.baskets && next.baskets.length === next.columns.length) {
      const firstB = next.baskets.shift()!;
      next.baskets.push(firstB);
    }
  }
}

/**
 * Move front spool into rack, advance snake step, and untie knots.
 */
export function tapColumn(
  s: GameState,
  col: number,
): { state: GameState; slots: number[]; conveyorShifted?: boolean } | null {
  const chk = checkTap(s, col);
  if (!chk.ok) return null;

  const partner = findTwinPartner(s, col, s.columns[col][0]);
  const next = cloneState(s);
  const front = next.columns[col].shift()!;
  front.hidden = false;
  if (front.isMystery) {
    front.isMystery = false; // Reveal hidden yarn color on rack!
  }

  const slots: number[] = [];
  const slot1 = next.rack.findIndex((r) => r === null);
  next.rack[slot1] = front;
  slots.push(slot1);

  // Twin partner handling: both spools move into the rack simultaneously
  if (partner) {
    // If partner was in the same column, after shifting 'front', the partner is now at index 0 of that column!
    // If partner was in another column, it was already at index 0 of partner.col!
    const targetCol = partner.col;
    const pSpool = next.columns[targetCol]?.shift();
    if (pSpool) {
      pSpool.hidden = false;
      if (pSpool.isMystery) pSpool.isMystery = false;
      const slot2 = next.rack.findIndex((r) => r === null);
      if (slot2 >= 0) {
        next.rack[slot2] = pSpool;
        slots.push(slot2);
      }
      dispenseFromBasket(next, targetCol);
    }
  }

  dispenseFromBasket(next, col);
  untieAdjacentKnots(next, col);
  next.moves += 1;

  // Step the snake forward closer to the vortex hole with every move!
  next.headPos = Math.min(next.dangerHolePos, next.headPos + next.stepPenalty);

  // Conveyor / Escalator mechanics:
  let conveyorShifted = false;
  if (next.conveyor?.active) {
    next.conveyor.movesUntilShift -= 1;
    if (next.conveyor.movesUntilShift <= 0) {
      next.conveyor.movesUntilShift = next.conveyor.interval;
      shiftConveyor(next);
      conveyorShifted = true;
    }
  }

  // Thaw countdown for ice zone
  if (next.iceZone && next.iceZone.thawDuration && next.iceZone.thawDuration > 0) {
    next.iceZone.thawDuration -= 1;
  }

  // Check loss condition: head reached the hole
  if (next.headPos >= next.dangerHolePos && next.remainingUnits > 0) {
    next.status = 'lost';
  }

  return { state: next, slots, conveyorShifted };
}

/**
 * Live unraveling tick: pulls yarn from the front of the snake into any matching rack spool.
 * When yarn is unraveled, the snake's head recedes backwards (relieving danger!),
 * and the spool winds up.
 */
export function unravelTick(s: GameState): {
  state: GameState;
  tickInfo: UnravelTick | null;
  blockedReason?: 'bridge' | 'ice';
} {
  if (s.status !== 'playing' || s.segments.length === 0) {
    return { state: s, tickInfo: null };
  }

  // 1. Bridge/Tunnel check: If snake head is under bridge, yarn cannot be unraveled!
  if (s.bridge && s.headPos >= s.bridge.start && s.headPos <= s.bridge.end) {
    return { state: s, tickInfo: null, blockedReason: 'bridge' };
  }

  // 2. Ice Zone check: If snake head is in frozen canal, yarn cannot be unraveled until thawed!
  if (
    s.iceZone &&
    s.headPos >= s.iceZone.start &&
    s.headPos <= s.iceZone.end &&
    (!s.iceZone.thawDuration || s.iceZone.thawDuration <= 0)
  ) {
    return { state: s, tickInfo: null, blockedReason: 'ice' };
  }

  const headSeg = s.segments[0];
  // 1. Look for matching color spool first, OR a wild rainbow spool!
  let matchingSlot = s.rack.findIndex(
    (sp) => sp !== null && sp.color === headSeg.color && sp.need > 0,
  );
  if (matchingSlot < 0) {
    matchingSlot = s.rack.findIndex(
      (sp) => sp !== null && sp.isWild && sp.need > 0,
    );
  }

  if (matchingSlot < 0) {
    // Check if rack is full with no matching spools & no moves possible
    const anyCanMove = s.columns.some((_, c) => canTap(s, c));
    if (!anyCanMove) {
      const next = cloneState(s);
      next.status = 'lost';
      return { state: next, tickInfo: null };
    }
    return { state: s, tickInfo: null };
  }

  const next = cloneState(s);
  const curHead = next.segments[0];
  const spool = next.rack[matchingSlot]!;

  // Pull 1 stitch unit
  const pullAmt = 1;
  curHead.units -= pullAmt;
  spool.need -= pullAmt;
  next.remainingUnits -= pullAmt;

  // Recede snake head back along track as it unravels (gives player breathing room!)
  next.headPos = Math.max(10, next.headPos - 1.2);

  let popped = false;
  if (spool.need <= 0) {
    // Dual spool: morphs into second layer!
    if (spool.secondColor && spool.secondCap) {
      spool.color = spool.secondColor;
      spool.cap = spool.secondCap;
      spool.need = spool.secondCap;
      spool.secondColor = undefined;
      spool.secondCap = undefined;
    } else {
      next.rack[matchingSlot] = null; // Spool complete -> POP!
      popped = true;
      thawFrozenSpools(next); // Crack ice on frozen spools in columns!
      if (next.iceZone) {
        next.iceZone.thawDuration = 2; // Popping a spool generates warm craft heat that thaws the ice zone for 2 moves!
      }
    }
  }

  if (curHead.units <= 0) {
    next.segments.shift(); // Finished this color segment!
  }

  if (next.remainingUnits <= 0 || next.segments.length === 0) {
    next.status = 'won';
  }

  return {
    state: next,
    tickInfo: {
      spoolSlot: matchingSlot,
      color: spool.isWild ? headSeg.color : spool.color,
      amount: pullAmt,
      snakeHeadPos: next.headPos,
      popped,
    },
  };
}

/**
 * Continuous natural crawl of the dragon along the track towards the wicker basket.
 * Advances slowly when idle to create steady Zuma-style tension and life.
 */
export function crawlTick(s: GameState, speed: number = 0.15): GameState {
  if (s.status !== 'playing' || s.remainingUnits <= 0) return s;
  const nextHeadPos = Math.min(s.dangerHolePos, s.headPos + speed);
  const nextStatus =
    nextHeadPos >= s.dangerHolePos && s.remainingUnits > 0 ? 'lost' : s.status;
  if (nextHeadPos === s.headPos && nextStatus === s.status) return s;
  return {
    ...s,
    headPos: nextHeadPos,
    status: nextStatus,
  };
}

/** Booster: instantly unties all knots, thaws ice & pushes the snake backwards safely */
export function pushBackSnake(s: GameState, pushAmount = 28): GameState {
  const next = cloneState(s);
  next.headPos = Math.max(10, next.headPos - pushAmount);
  next.columns.forEach((col) => {
    col.forEach((sp) => {
      if (sp.knots > 0) sp.knots = 0;
      if (sp.frozen && sp.frozen > 0) sp.frozen = 0;
    });
  });
  next.baskets.forEach((basket) => {
    basket.forEach((sp) => {
      if (sp.frozen && sp.frozen > 0) sp.frozen = 0;
    });
  });
  // If rack is full, add an emergency slot so the player has room to make moves without altering any spool's color!
  if (next.rack.every((sp) => sp !== null)) {
    next.rack = [...next.rack, null];
  }
  if (next.status === 'lost') next.status = 'playing';
  return next;
}

/** Booster: adds an extra rack slot */
export function addSlot(s: GameState): GameState {
  const next = cloneState(s);
  next.rack.push(null);
  next.headPos = Math.max(10, next.headPos - 12);
  if (next.status === 'lost') next.status = 'playing';
  return next;
}

/** Booster: Magnet instantly unravels the entire front segment of the snake! */
export function magnetFront(
  s: GameState,
): { state: GameState; color: string; amount: number } | null {
  if (s.segments.length === 0) return null;
  const next = cloneState(s);
  const seg = next.segments.shift()!;
  next.remainingUnits -= seg.units;
  next.headPos = Math.max(10, next.headPos - seg.units * 1.5);

  // Clear any spool on rack waiting for this color
  next.rack.forEach((sp, idx) => {
    if (sp && sp.color === seg.color) {
      next.rack[idx] = null;
    }
  });

  if (next.remainingUnits <= 0 || next.segments.length === 0) {
    next.status = 'won';
  } else if (next.status === 'lost') {
    next.status = 'playing';
  }

  return { state: next, color: seg.color, amount: seg.units };
}
