import React, { memo } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { YARN } from '../theme';

/** A single knit stitch ("V") drawn into an s×s box at (x, y). */
function stitchPaths(x: number, y: number, s: number) {
  const m = s * 0.5;
  const left = `M${x + s * 0.1} ${y + s * 0.12} Q${x + s * 0.12} ${y + s * 0.62} ${x + m} ${y + s * 0.92} Q${x + s * 0.44} ${y + s * 0.4} ${x + s * 0.1} ${y + s * 0.12}Z`;
  const right = `M${x + s * 0.9} ${y + s * 0.12} Q${x + s * 0.88} ${y + s * 0.62} ${x + m} ${y + s * 0.92} Q${x + s * 0.56} ${y + s * 0.4} ${x + s * 0.9} ${y + s * 0.12}Z`;
  return { left, right };
}

interface Props {
  width: number;
  height: number;
  grid: (string | null)[];
  cell: number;
}

function BoardImpl({ width, height, grid, cell }: Props) {
  const W = width * cell;
  const H = height * cell;
  return (
    <View style={{ width: W, height: H }}>
      <Svg width={W} height={H}>
        {/* empty canvas: soft dots where stitches used to be */}
        <Rect x={0} y={0} width={W} height={H} rx={cell * 0.4} fill="rgba(255,255,255,0.55)" />
        {grid.map((c, i) => {
          const x = (i % width) * cell;
          const y = Math.floor(i / width) * cell;
          if (!c) return <Circle key={i} cx={x + cell / 2} cy={y + cell / 2} r={cell * 0.08} fill="rgba(91,58,94,0.15)" />;
          const col = YARN[c];
          const { left, right } = stitchPaths(x, y, cell);
          return (
            <React.Fragment key={i}>
              <Rect x={x + 0.3} y={y + 0.3} width={cell - 0.6} height={cell - 0.6} rx={cell * 0.18} fill={col.dark} />
              <Path d={left} fill={col.base} stroke={col.light} strokeWidth={cell * 0.05} />
              <Path d={right} fill={col.base} stroke={col.light} strokeWidth={cell * 0.05} />
            </React.Fragment>
          );
        })}
      </Svg>
    </View>
  );
}

export const Board = memo(BoardImpl);
