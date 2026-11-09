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
    const allColumnsEmpty =
      s.columns.every((col) => col.length === 0) &&
      s.baskets.every((b) => b.length === 0);

    if (allColumnsEmpty && s.rack.some((sp) => sp !== null)) {
      const next = cloneState(s);
      // 1. If a dual spool on the rack has headSeg.color as its inner layer, flip inner & outer layers:
      const dualIdx = next.rack.findIndex(
        (sp) => sp !== null && sp.secondColor === headSeg.color && (sp.secondCap ?? 0) > 0,
      );
      if (dualIdx >= 0) {
        const dsp = next.rack[dualIdx]!;
        const prevCol = dsp.color;
        const prevNeed = dsp.need;
        dsp.color = dsp.secondColor!;
        dsp.need = dsp.secondCap!;
        dsp.cap = dsp.secondCap!;
        dsp.secondColor = prevCol;
        dsp.secondCap = prevNeed;
        return unravelTick(next);
      }
      // 2. Reconcile rack spools with remaining snake segments:
      reconcileSpoolsWithSnake(next);
      const retrySlot = next.rack.findIndex(
        (sp) => sp !== null && (sp.color === headSeg.color || sp.isWild) && sp.need > 0,
      );
      if (retrySlot >= 0) {
        return unravelTick(next);
      }
      const firstRackIdx = next.rack.findIndex((sp) => sp !== null && sp.need > 0);
      if (firstRackIdx >= 0) {
        next.rack[firstRackIdx]!.color = headSeg.color;
        reconcileSpoolsWithSnake(next, firstRackIdx);
        return unravelTick(next);
      }
    }

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
  const wasWild = !!spool.isWild;

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

  // If a Rainbow Wild spool absorbed yarn, keep reserve spools 100% synced with remaining snake segments!
  if (wasWild && next.segments.length > 0) {
    reconcileSpoolsWithSnake(next, matchingSlot);
  }

  if (next.remainingUnits <= 0 || next.segments.length === 0) {
    next.status = 'won';
  }

  return {
    state: next,
    tickInfo: {
      spoolSlot: matchingSlot,
      color: wasWild ? headSeg.color : spool.color,
      amount: pullAmt,
      snakeHeadPos: next.headPos,
      popped,
    },
  };
}

/**
 * Guarantees 100% strict stitch-for-stitch conservation between remaining snake segments
 * and remaining spools (rack + columns + baskets + dual layers).
 * Whenever Color Swap, Magnet, or a Rainbow Wild spool alters color distribution,
 * this reconciles reserve/rack spools so every remaining snake stitch has a matching spool.
 */
export function reconcileSpoolsWithSnake(
  s: GameState,
  protectedRackSlot: number = -1,
): void {
  // 1. Calculate exact stitch demand per color on the snake:
  const snakeNeed: Record<string, number> = {};
  let totalSnake = 0;
  for (const seg of s.segments) {
    if (seg.units > 0) {
      snakeNeed[seg.color] = (snakeNeed[seg.color] || 0) + seg.units;
      totalSnake += seg.units;
    }
  }
  s.remainingUnits = totalSnake;

  if (totalSnake <= 0) {
    s.rack = s.rack.map(() => null);
    s.columns = s.columns.map(() => []);
    s.baskets = s.baskets.map(() => []);
    return;
  }

  interface LayerRef {
    getColor: () => string;
    setColor: (c: string) => void;
    getNeed: () => number;
    setNeed: (n: number) => void;
    canSplitDual: () => boolean;
    splitDual: (outerCol: string, outerNeed: number, innerCol: string, innerNeed: number) => void;
    isWild: boolean;
    priority: number;
  }

  const layers: LayerRef[] = [];

  const pushSpoolLayers = (sp: Spool, basePriority: number, isProtected = false) => {
    if (sp.secondColor && sp.secondCap && sp.secondCap > 0) {
      layers.push({
        getColor: () => sp.secondColor!,
        setColor: (col) => {
          sp.secondColor = col;
        },
        getNeed: () => sp.secondCap!,
        setNeed: (n) => {
          sp.secondCap = n;
        },
        canSplitDual: () => false,
        splitDual: () => {},
        isWild: false,
        priority: basePriority,
      });
    }
    if (sp.need > 0) {
      layers.push({
        getColor: () => sp.color,
        setColor: (col) => {
          sp.color = col;
        },
        getNeed: () => sp.need,
        setNeed: (n) => {
          sp.need = n;
          sp.cap = Math.max(sp.cap, n);
        },
        canSplitDual: () => !sp.secondColor && !sp.isWild,
        splitDual: (outerCol, outerNeed, innerCol, innerNeed) => {
          sp.color = outerCol;
          sp.need = outerNeed;
          sp.cap = outerNeed;
          sp.secondColor = innerCol;
          sp.secondCap = innerNeed;
        },
        isWild: !!sp.isWild,
        priority: sp.isWild ? 99 : isProtected ? 6 : basePriority,
      });
    }
  };

  // Priority 1: Baskets (back to front)
  for (let c = 0; c < s.baskets.length; c++) {
    const b = s.baskets[c];
    for (let i = b.length - 1; i >= 0; i--) {
      pushSpoolLayers(b[i], 1);
    }
  }

  // Priority 2 & 3: Columns (bottom to top)
  for (let c = 0; c < s.columns.length; c++) {
    const col = s.columns[c];
    for (let i = col.length - 1; i >= 0; i--) {
      pushSpoolLayers(col[i], i > 0 ? 2 : 3);
    }
  }

  // Priority 4..6: Rack spools
  const headColor = s.segments[0]?.color;
  for (let i = 0; i < s.rack.length; i++) {
    const sp = s.rack[i];
    if (!sp) continue;
    const isProtected = i === protectedRackSlot || sp.color === headColor;
    pushSpoolLayers(sp, 4, isProtected);
  }

  layers.sort((a, b) => a.priority - b.priority);

  // 2. Calculate current spool supply per color:
  const spoolHave: Record<string, number> = {};
  for (const l of layers) {
    const c = l.getColor();
    spoolHave[c] = (spoolHave[c] || 0) + l.getNeed();
  }

  const allColors = Array.from(
    new Set([...Object.keys(snakeNeed), ...Object.keys(spoolHave)]),
  );

  // 3. Pass 1: Exact-need whole-layer recoloring from surplusColor to deficitColor
  for (const l of layers) {
    if (l.isWild) continue;
    const curCol = l.getColor();
    const need = l.getNeed();
    const surp = (spoolHave[curCol] || 0) - (snakeNeed[curCol] || 0);
    if (surp >= need && need > 0) {
      const defCol = allColors.find(
        (c) => c !== curCol && (snakeNeed[c] || 0) - (spoolHave[c] || 0) >= need,
      );
      if (defCol) {
        l.setColor(defCol);
        spoolHave[curCol] -= need;
        spoolHave[defCol] = (spoolHave[defCol] || 0) + need;
      }
    }
  }

  // 4. Pass 2: Transfer any remaining surplus units to deficit colors
  let guard = 0;
  while (guard++ < 120) {
    const surpCol = allColors.find((c) => (spoolHave[c] || 0) > (snakeNeed[c] || 0));
    const defCol = allColors.find((c) => (snakeNeed[c] || 0) > (spoolHave[c] || 0));
    if (!surpCol || !defCol) break;

    const surpAmt = (spoolHave[surpCol] || 0) - (snakeNeed[surpCol] || 0);
    const defAmt = (snakeNeed[defCol] || 0) - (spoolHave[defCol] || 0);

    const surpLayer =
      layers.find((l) => !l.isWild && l.getColor() === surpCol && l.getNeed() > 0) ||
      layers.find((l) => l.getColor() === surpCol && l.getNeed() > 0);
    if (!surpLayer) break;

    const layerNeed = surpLayer.getNeed();
    if (layerNeed <= surpAmt && layerNeed <= defAmt) {
      surpLayer.setColor(defCol);
      spoolHave[surpCol] -= layerNeed;
      spoolHave[defCol] = (spoolHave[defCol] || 0) + layerNeed;
    } else {
      const transfer = Math.min(layerNeed, surpAmt, defAmt);
      const defLayer = layers.find((l) => !l.isWild && l.getColor() === defCol && l.getNeed() > 0);
      if (defLayer && layerNeed > transfer) {
        surpLayer.setNeed(layerNeed - transfer);
        defLayer.setNeed(defLayer.getNeed() + transfer);
        spoolHave[surpCol] -= transfer;
        spoolHave[defCol] = (spoolHave[defCol] || 0) + transfer;
      } else if (layerNeed > transfer && surpLayer.canSplitDual()) {
        // Split single spool into 2 layers: outer (defCol, transfer) + inner (surpCol, layerNeed - transfer)
        const remainSurp = layerNeed - transfer;
        const headC = s.segments[0]?.color;
        if (surpCol === headC) {
          surpLayer.splitDual(surpCol, remainSurp, defCol, transfer);
        } else {
          surpLayer.splitDual(defCol, transfer, surpCol, remainSurp);
        }
        spoolHave[surpCol] -= transfer;
        spoolHave[defCol] = (spoolHave[defCol] || 0) + transfer;
        // Rebuild layers to include newly created inner layer if further passes are needed
        return reconcileSpoolsWithSnake(s, protectedRackSlot);
      } else if (layerNeed <= surpAmt) {
        surpLayer.setColor(defCol);
        surpLayer.setNeed(transfer);
        spoolHave[surpCol] -= layerNeed;
        spoolHave[defCol] = (spoolHave[defCol] || 0) + transfer;
      } else {
        surpLayer.setColor(defCol);
        spoolHave[surpCol] -= layerNeed;
        spoolHave[defCol] = (spoolHave[defCol] || 0) + layerNeed;
      }
    }
  }

  // 5. Pass 3a: Trim any net excess spool units (e.g. after Magnet removes a segment)
  for (const colName of allColors) {
    while ((spoolHave[colName] || 0) > (snakeNeed[colName] || 0)) {
      const excess = (spoolHave[colName] || 0) - (snakeNeed[colName] || 0);
      const layer =
        layers.find((l) => !l.isWild && l.getColor() === colName && l.getNeed() > 0) ||
        layers.find((l) => l.getColor() === colName && l.getNeed() > 0);
      if (!layer) break;
      const cut = Math.min(layer.getNeed(), excess);
      layer.setNeed(layer.getNeed() - cut);
      spoolHave[colName] -= cut;
    }
  }

  // 6. Pass 3b: Add any net missing spool units if total spool units < snakeNeed
  for (const colName of allColors) {
    const missing = (snakeNeed[colName] || 0) - (spoolHave[colName] || 0);
    if (missing > 0) {
      const layer =
        layers.find((l) => !l.isWild && l.getColor() === colName && l.getNeed() > 0) ||
        layers.find((l) => !l.isWild && l.getNeed() > 0);
      if (layer) {
        if (layer.getColor() === colName) {
          layer.setNeed(layer.getNeed() + missing);
        } else if (layer.canSplitDual()) {
          layer.splitDual(colName, missing, layer.getColor(), layer.getNeed());
        } else {
          layer.setNeed(layer.getNeed() + missing);
        }
        spoolHave[colName] = (spoolHave[colName] || 0) + missing;
      }
    }
  }

  // 7. Cleanup any spools whose need or secondCap dropped to <= 0:
  const normalizeSpool = (sp: Spool): Spool | null => {
    if (sp.secondCap !== undefined && sp.secondCap <= 0) {
      sp.secondColor = undefined;
      sp.secondCap = undefined;
    }
    if (sp.need <= 0) {
      if (sp.secondColor && sp.secondCap && sp.secondCap > 0) {
        sp.color = sp.secondColor;
        sp.need = sp.secondCap;
        sp.cap = sp.secondCap;
        sp.secondColor = undefined;
        sp.secondCap = undefined;
        return sp;
      }
      return null;
    }
    return sp;
  };

  for (let i = 0; i < s.rack.length; i++) {
    if (s.rack[i]) {
      s.rack[i] = normalizeSpool(s.rack[i]!);
    }
  }
  for (let c = 0; c < s.baskets.length; c++) {
    s.baskets[c] = s.baskets[c]
      .map((sp) => normalizeSpool(sp))
      .filter((sp): sp is Spool => sp !== null);
  }
  for (let c = 0; c < s.columns.length; c++) {
    s.columns[c] = s.columns[c]
      .map((sp) => normalizeSpool(sp))
      .filter((sp): sp is Spool => sp !== null);
    while (s.columns[c].length < 3 && s.baskets[c] && s.baskets[c].length > 0) {
      const nextFromBasket = s.baskets[c].shift()!;
      nextFromBasket.hidden = false;
      s.columns[c].push(nextFromBasket);
    }
  }
}

/**
 * Swaps a stuck rack spool at `slotIdx` to match the front snake segment's color
 * while strictly conserving exact stitch counts (`need` & `cap`) across all spools!
 */
export function swapRackSpoolColor(s: GameState, slotIdx: number): GameState {
  if (slotIdx < 0 || slotIdx >= s.rack.length) return s;
  const rackSp = s.rack[slotIdx];
  const headSeg = s.segments[0];
  if (!rackSp || !headSeg || rackSp.color === headSeg.color) return s;

  const next = cloneState(s);
  const targetSlotSp = next.rack[slotIdx]!;
  const targetColor = next.segments[0].color;
  const headUnits = next.segments[0].units;
  const oldColor = targetSlotSp.color;
  const oldNeed = targetSlotSp.need;
  const oldCap = targetSlotSp.cap;

  // Gather all candidate spools in columns & baskets with color === targetColor (excluding wilds)
  const candidates: Spool[] = [];
  for (const col of next.columns) {
    for (const sp of col) {
      if (sp.color === targetColor && !sp.isWild) candidates.push(sp);
    }
  }
  for (const b of next.baskets) {
    for (const sp of b) {
      if (sp.color === targetColor && !sp.isWild) candidates.push(sp);
    }
  }

  if (candidates.length > 0) {
    // Best candidate order:
    // 1. Exact match with headUnits (pops right when front segment finishes!)
    // 2. Exact match with oldNeed (identical size)
    // 3. Smaller or equal to headUnits (pops cleanly during front segment!)
    // 4. Closest need to headUnits
    candidates.sort((a, b) => {
      const aExactHead = a.need === headUnits ? 0 : 1;
      const bExactHead = b.need === headUnits ? 0 : 1;
      if (aExactHead !== bExactHead) return aExactHead - bExactHead;

      const aExactOld = a.need === oldNeed ? 0 : 1;
      const bExactOld = b.need === oldNeed ? 0 : 1;
      if (aExactOld !== bExactOld) return aExactOld - bExactOld;

      const aFitsHead = a.need <= headUnits ? 0 : 1;
      const bFitsHead = b.need <= headUnits ? 0 : 1;
      if (aFitsHead !== bFitsHead) return aFitsHead - bFitsHead;

      return Math.abs(a.need - headUnits) - Math.abs(b.need - headUnits);
    });

    const chosen = candidates[0];
    // Trade (color, need, cap) between rack[slotIdx] and chosen reserve spool!
    // This keeps the multiset of (color, need) across the entire board 100% invariant!
    targetSlotSp.color = targetColor;
    targetSlotSp.need = chosen.need;
    targetSlotSp.cap = chosen.cap;

    chosen.color = oldColor;
    chosen.need = oldNeed;
    chosen.cap = Math.max(oldNeed, oldCap);
  } else {
    // Check if a dual-layer spool in columns/baskets has secondColor === targetColor:
    let dualFound: Spool | null = null;
    for (const col of next.columns) {
      const sp = col.find((x) => x.secondColor === targetColor && x.secondCap && x.secondCap > 0);
      if (sp) {
        dualFound = sp;
        break;
      }
    }
    if (!dualFound) {
      for (const b of next.baskets) {
        const sp = b.find((x) => x.secondColor === targetColor && x.secondCap && x.secondCap > 0);
        if (sp) {
          dualFound = sp;
          break;
        }
      }
    }
    if (dualFound && dualFound.secondCap) {
      const innerNeed = dualFound.secondCap;
      targetSlotSp.color = targetColor;
      targetSlotSp.need = innerNeed;
      targetSlotSp.cap = innerNeed;
      dualFound.secondColor = oldColor;
      dualFound.secondCap = oldNeed;
    } else {
      targetSlotSp.color = targetColor;
    }
  }

  reconcileSpoolsWithSnake(next, slotIdx);
  return next;
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

  // Deduct up to seg.units from matching spools on the rack first:
  let toDeduct = seg.units;
  for (let idx = 0; idx < next.rack.length && toDeduct > 0; idx++) {
    const sp = next.rack[idx];
    if (sp && sp.color === seg.color && !sp.isWild) {
      const take = Math.min(toDeduct, sp.need);
      sp.need -= take;
      toDeduct -= take;
      if (sp.need <= 0) {
        if (sp.secondColor && sp.secondCap) {
          sp.color = sp.secondColor;
          sp.cap = sp.secondCap;
          sp.need = sp.secondCap;
          sp.secondColor = undefined;
          sp.secondCap = undefined;
        } else {
          next.rack[idx] = null;
          thawFrozenSpools(next);
        }
      }
    }
  }

  // Reconcile any remaining deducted units across columns & baskets so spool counts strictly match the snake!
  reconcileSpoolsWithSnake(next);

  if (next.remainingUnits <= 0 || next.segments.length === 0) {
    next.status = 'won';
  } else if (next.status === 'lost') {
    next.status = 'playing';
  }

  return { state: next, color: seg.color, amount: seg.units };
}
