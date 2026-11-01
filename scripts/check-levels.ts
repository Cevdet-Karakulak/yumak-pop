import { canTap, tapColumn, unravelTick } from '../src/game/engine';
import { createLevel, getLevelInfo, isLevelSolvable, TOTAL_LEVELS } from '../src/game/levels';

let ok = 0;
for (let n = 1; n <= TOTAL_LEVELS; n++) {
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

  const solvable = isLevelSolvable(lvl, 150);
  if (solvable) ok++;

  console.log(
    `L${n} [${info.trackShape}] units=${lvl.totalUnits} spools=${spools} (knots=${knots} twins=${twins} basket=${baskets}) gen=${ms}ms solvable=${solvable}`,
  );
}
console.log(`${ok}/${TOTAL_LEVELS} solvable`);
