import { canTap, tapColumn, unravelTick } from '../src/game/engine';
import { createLevel, getLevelInfo, isLevelSolvable, TOTAL_LEVELS } from '../src/game/levels';

// Parse start and end levels from command line arguments, default to 1..TOTAL_LEVELS
const arg1 = process.argv[2];
const arg2 = process.argv[3];

const start = arg1 && !isNaN(parseInt(arg1, 10)) ? parseInt(arg1, 10) : 1;
const end = arg2 && !isNaN(parseInt(arg2, 10)) ? parseInt(arg2, 10) : TOTAL_LEVELS;

console.log(`Checking level solvability from Level ${start} to Level ${end}...`);

let ok = 0;
const total = end - start + 1;

for (let n = start; n <= end; n++) {
  const t0 = Date.now();
  const lvl = createLevel(n);
  const info = getLevelInfo(n);
  const ms = Date.now() - t0;
  const spools =
    lvl.columns.reduce((a, c) => a + c.length, 0) +
    lvl.baskets.reduce((a, b) => a + b.length, 0);
  const knots = lvl.columns.reduce((a, c) => a + c.filter((s) => s.knots > 0).length, 0);
  const twins = lvl.columns.reduce((a, c) => a + c.filter((s) => s.twinId).length, 0) / 2;
  const baskets = lvl.baskets.reduce((a, b) => a + b.length, 0);

  const solvable = isLevelSolvable(lvl, 160);
  if (solvable) ok++;

  console.log(
    `L${n} [${info.trackShape}] units=${lvl.totalUnits} spools=${spools} (knots=${knots} twins=${twins} basket=${baskets}) gen=${ms}ms solvable=${solvable}`,
  );
}

console.log(`Result: ${ok}/${total} solvable (${ok === total ? 'ALL SOLVABLE' : 'FAILED DETECTED'})`);
if (ok !== total) {
  process.exit(1);
}
