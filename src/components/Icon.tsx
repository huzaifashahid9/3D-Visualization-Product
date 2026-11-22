import Svg, { Ellipse, Path, Rect } from 'react-native-svg';

export type IconName =
  | 'home'
  | 'cube'
  | 'pulse'
  | 'back'
  | 'arrow'
  | 'spin'
  | 'rotate'
  | 'plus'
  | 'minus'
  | 'play'
  | 'pause'
  | 'soundOff'
  | 'soundOn'
  | 'logo';

interface Props {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

/** Stroke icons drawn with react-native-svg so they stay sharp at any size. */
export function Icon({ name, size = 22, color = '#FFFFFF', strokeWidth = 2 }: Props) {
  const common = {
    fill: 'none',
    stroke: color,
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {name === 'home' && <Path {...common} d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />}
      {name === 'cube' && (
        <>
          <Path {...common} d="M12 2 3 7v10l9 5 9-5V7z" />
          <Path {...common} d="m3 7 9 5 9-5" />
          <Path {...common} d="M12 12v10" />
        </>
      )}
      {name === 'pulse' && <Path {...common} d="M2 12h4l3-8 4 16 3-8h6" />}
      {name === 'back' && <Path {...common} d="m15 18-6-6 6-6" />}
      {name === 'arrow' && (
        <>
          <Path {...common} d="M5 12h14" />
          <Path {...common} d="m13 6 6 6-6 6" />
        </>
      )}
      {name === 'spin' && (
        <>
          <Ellipse {...common} cx={12} cy={12} rx={10} ry={4} />
          <Path {...common} d="m15 5 3 3-3 3" />
        </>
      )}
      {name === 'rotate' && (
        <>
          <Path {...common} d="M21 12a9 9 0 1 1-3-6.7" />
          <Path {...common} d="M21 4v5h-5" />
        </>
      )}
      {name === 'plus' && (
        <>
          <Path {...common} d="M5 12h14" />
          <Path {...common} d="M12 5v14" />
        </>
      )}
      {name === 'minus' && <Path {...common} d="M5 12h14" />}
      {name === 'play' && <Path d="M7 4v16l13-8z" fill={color} />}
      {name === 'pause' && (
        <>
          <Rect x={6} y={4} width={4} height={16} rx={1} fill={color} />
          <Rect x={14} y={4} width={4} height={16} rx={1} fill={color} />
        </>
      )}
      {name === 'soundOff' && (
        <>
          <Path {...common} d="M11 5 6 9H3v6h3l5 4z" />
          <Path {...common} d="m22 9-6 6" />
          <Path {...common} d="m16 9 6 6" />
        </>
      )}
      {name === 'soundOn' && (
        <>
          <Path {...common} d="M11 5 6 9H3v6h3l5 4z" />
          <Path {...common} d="M15.5 8.5a5 5 0 0 1 0 7" />
          <Path {...common} d="M19 5a10 10 0 0 1 0 14" />
        </>
      )}
      {name === 'logo' && (
        <>
          <Ellipse {...common} cx={12} cy={15} rx={9} ry={3.6} />
          <Path {...common} d="M4.5 13.5C5.5 4 18.5 4 19.5 13.5" />
        </>
      )}
    </Svg>
  );
}
