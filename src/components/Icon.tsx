import Svg, { Circle, Ellipse, Path, Rect } from 'react-native-svg';

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
  | 'logo'
  | 'check'
  | 'close'
  | 'chevron'
  | 'phone'
  | 'message'
  | 'alert'
  | 'pin'
  | 'log'
  | 'gear'
  | 'lock'
  | 'user'
  | 'shield'
  | 'export'
  | 'bell'
  | 'refresh'
  | 'volume'
  | 'battery'
  | 'bluetooth'
  | 'note'
  | 'contacts'
  | 'target'
  | 'globe'
  | 'trash'
  | 'clock'
  | 'headset'
  | 'tablet';

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
          <Ellipse {...common} cx={12} cy={16} rx={9} ry={3.4} />
          <Path {...common} d="M3.5 15C4 5 20 5 20.5 15" />
          <Circle cx={12} cy={6.6} r={1.6} fill={color} />
        </>
      )}
      {name === 'check' && (<Path {...common} d="m5 12 5 5 9-10" />)}
      {name === 'close' && (<><Path {...common} d="M6 6l12 12" /><Path {...common} d="M18 6 6 18" /></>)}
      {name === 'chevron' && (<Path {...common} d="m9 18 6-6-6-6" />)}
      {name === 'phone' && (<Path {...common} d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z" />)}
      {name === 'message' && (<Path {...common} d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" />)}
      {name === 'alert' && (<><Path {...common} d="M12 3 2 20h20z" /><Path {...common} d="M12 10v4" /><Path {...common} d="M12 17.5v.01" /></>)}
      {name === 'pin' && (<><Path {...common} d="M12 22s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12z" /><Circle {...common} cx={12} cy={10} r={2.5} /></>)}
      {name === 'log' && (<><Path {...common} d="M8 6h13" /><Path {...common} d="M8 12h13" /><Path {...common} d="M8 18h13" /><Path {...common} d="M3 6h.01" /><Path {...common} d="M3 12h.01" /><Path {...common} d="M3 18h.01" /></>)}
      {name === 'gear' && (<><Circle {...common} cx={12} cy={12} r={3} /><Path {...common} d="M12 2v3M12 19v3M4.9 4.9 7 7M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1 7 17M17 7l2.1-2.1" /></>)}
      {name === 'lock' && (<><Rect {...common} x={4} y={11} width={16} height={10} rx={2} /><Path {...common} d="M8 11V7a4 4 0 0 1 8 0v4" /></>)}
      {name === 'user' && (<><Circle {...common} cx={12} cy={8} r={4} /><Path {...common} d="M4 21a8 8 0 0 1 16 0" /></>)}
      {name === 'shield' && (<Path {...common} d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />)}
      {name === 'export' && (<><Path {...common} d="M12 3v12" /><Path {...common} d="m7 8 5-5 5 5" /><Path {...common} d="M5 21h14" /></>)}
      {name === 'bell' && (<><Path {...common} d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><Path {...common} d="M10.3 21a1.9 1.9 0 0 0 3.4 0" /></>)}
      {name === 'refresh' && (<><Path {...common} d="M21 12a9 9 0 1 1-3-6.7" /><Path {...common} d="M21 4v5h-5" /></>)}
      {name === 'volume' && (<><Path {...common} d="M11 5 6 9H3v6h3l5 4z" /><Path {...common} d="M15.5 8.5a5 5 0 0 1 0 7" /></>)}
      {name === 'battery' && (<><Rect {...common} x={2} y={7} width={18} height={10} rx={2} /><Path {...common} d="M22 11v2M6 10v4M10 10v4" /></>)}
      {name === 'bluetooth' && (<Path {...common} d="m7 7 10 10-5 5V2l5 5L7 17" />)}
      {name === 'note' && (<><Path {...common} d="M4 4h16v12l-4 4H4z" /><Path {...common} d="M16 20v-4h4" /></>)}
      {name === 'contacts' && (<><Circle {...common} cx={9} cy={8} r={3.5} /><Path {...common} d="M2.5 20a6.5 6.5 0 0 1 13 0" /><Path {...common} d="M16 4.5a3.5 3.5 0 0 1 0 7" /><Path {...common} d="M18 14a6.5 6.5 0 0 1 3.5 6" /></>)}
      {name === 'target' && (<><Circle {...common} cx={12} cy={12} r={9} /><Circle {...common} cx={12} cy={12} r={5} /><Circle {...common} cx={12} cy={12} r={1.5} /></>)}
      {name === 'globe' && (<><Circle {...common} cx={12} cy={12} r={9} /><Path {...common} d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></>)}
      {name === 'trash' && (<><Path {...common} d="M3 6h18" /><Path {...common} d="M8 6V4h8v2" /><Path {...common} d="M6 6l1 15h10l1-15" /></>)}
      {name === 'clock' && (<><Circle {...common} cx={12} cy={12} r={9} /><Path {...common} d="M12 7v5l3 2" /></>)}
      {name === 'headset' && (<><Ellipse {...common} cx={12} cy={16} rx={9} ry={3.4} /><Path {...common} d="M3.5 15C4 5 20 5 20.5 15" /><Circle cx={12} cy={6.6} r={1.6} fill={color} /></>)}
      {name === 'tablet' && (<><Rect {...common} x={6} y={2} width={12} height={20} rx={3} /><Path {...common} d="M11 18h2" /></>)}
    </Svg>
  );
}
