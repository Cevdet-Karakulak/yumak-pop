import { canTap, tapColumn, unravelTick } from '../src/game/engine';
import {
  createLevel,
  getLevelInfo,
  isLevelSolvable,
  isTriviallySolvedSequentially,
  TOTAL_LEVELS,
} from '../src/game/levels';

const arg1 = process.argv[2];
const arg2 = process.argv[3];

const start = arg1 && !isNaN(parseInt(arg1, 10)) ? parseInt(arg1, 10) : 1;
const end = arg2 && !isNaN(parseInt(arg2, 10)) ? parseInt(arg2, 10) : TOTAL_LEVELS;

console.log(`Checking level solvability & anti-round-robin quality from Level ${start} to Level ${end}...`);

let ok = 0;
let fallbacks = 0;
let sequentialSolved = 0;
let uniformCaps = 0;
const total = end - start + 1;

for (let n = start; n <= end; n++) {
  const t0 = Date.now();
  const lvl = createLevel(n);
  const info = getLevelInfo(n);
  const ms = Date.now() - t0;
  const allSpools = [
    ...lvl.columns.flat(),
    ...lvl.baskets.flat(),
  ];
  const spools = allSpools.length;
  const knots = lvl.columns.reduce((a, c) => a + c.filter((s) => s.knots > 0).length, 0);
  const twins = lvl.columns.reduce((a, c) => a + c.filter((s) => s.twinId).length, 0) / 2;
  const baskets = lvl.baskets.reduce((a, b) => a + b.length, 0);
  const distinctCaps = Array.from(new Set(allSpools.map((s) => s.cap))).sort((a, b) => a - b);

  const solvable = isLevelSolvable(lvl, 500);
  const seqTrivial = n > 1 && isTriviallySolvedSequentially(lvl, n <= 4 ? 0.85 : 0.65);
  const isFallback = n >= 7 && knots === 0 && twins === 0 && baskets === 0;
  const isUniform = distinctCaps.length <= 1;

  if (solvable && !seqTrivial && !isFallback && !isUniform) ok++;
  if (isFallback) fallbacks++;
  if (seqTrivial) sequentialSolved++;
  if (isUniform) uniformCaps++;

  if (!solvable || seqTrivial || isFallback || isUniform || n <= 35 || n % 25 === 0) {
    console.log(
      `L${n} [${info.trackShape}] units=${lvl.totalUnits} spools=${spools} caps=[${distinctCaps.join(',')}] (knots=${knots} twins=${twins} basket=${baskets}) gen=${ms}ms solvable=${solvable} seqTrivial=${seqTrivial} fallback=${isFallback}`,
    );
  }
}

console.log(
  `Result: ${ok}/${total} passed all checks | fallbacks=${fallbacks} | seqTrivial=${sequentialSolved} | uniformCaps=${uniformCaps}`,
);
if (ok !== total) {
  process.exit(1);
}
