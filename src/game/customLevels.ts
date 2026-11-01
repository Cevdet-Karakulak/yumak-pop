import { TrackShape } from './levels';

/**
 * Custom Level Definition Format:
 * Allows game designers to handcraft specific signature levels,
 * boss challenges, or seasonal puzzle designs.
 */
export interface CustomLevelDefinition {
  name?: string;
  trackShape: TrackShape;
  segments: { color: string; count: number }[];
  columns: {
    color: string;
    count: number;
    knots?: number;
    twinId?: string;
    isMystery?: boolean;
    isWild?: boolean;
    isFrozen?: boolean;
    dualColor?: string;
  }[][];
  baskets?: {
    color: string;
    count: number;
  }[][];
  hard?: boolean;
}

/**
 * Registry of manual level overrides.
 * Example:
 *   CUSTOM_LEVEL_OVERRIDES[50] = { ... };
 * When defined, createLevel(n) uses this definition instead of procedural generation.
 */
export const CUSTOM_LEVEL_OVERRIDES: Record<number, CustomLevelDefinition> = {};
