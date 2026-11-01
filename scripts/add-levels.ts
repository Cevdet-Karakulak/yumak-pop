import fs from 'fs';
import path from 'path';
import { createLevel, isLevelSolvable, TOTAL_LEVELS } from '../src/game/levels';

const amountArg = process.argv[2];
const amount = amountArg && !isNaN(parseInt(amountArg, 10)) ? parseInt(amountArg, 10) : 50;

const currentTotal = TOTAL_LEVELS;
const newTotal = currentTotal + amount;

console.log(`========================================`);
console.log(`🧶 YUMAK POP LEVEL EXPANDER`);
console.log(`Current Total: ${currentTotal} levels`);
console.log(`Adding ${amount} new levels (Levels ${currentTotal + 1} to ${newTotal})...`);
console.log(`========================================`);

// 1. Verify solvability of all new levels
let failedCount = 0;
for (let lvl = currentTotal + 1; lvl <= newTotal; lvl++) {
  const state = createLevel(lvl);
  const solvable = isLevelSolvable(state, 160);
  if (!solvable) {
    console.error(`❌ Level ${lvl} could not be solved!`);
    failedCount++;
  } else {
    console.log(`  ✓ Level ${lvl} generated and verified solvable.`);
  }
}

if (failedCount > 0) {
  console.error(`\nAborting: ${failedCount} levels were not solvable.`);
  process.exit(1);
}

// 2. Update src/game/levels.ts TOTAL_LEVELS
const levelsFilePath = path.join(__dirname, '../src/game/levels.ts');
let content = fs.readFileSync(levelsFilePath, 'utf-8');
content = content.replace(
  /export const TOTAL_LEVELS = \d+;/,
  `export const TOTAL_LEVELS = ${newTotal};`,
);
fs.writeFileSync(levelsFilePath, content, 'utf-8');

console.log(`\n🎉 SUCCESS!`);
console.log(`Added ${amount} new levels.`);
console.log(`New TOTAL_LEVELS is now ${newTotal}.`);
console.log(`All ${amount} levels verified 100% solvable with 0 deadlocks.`);
