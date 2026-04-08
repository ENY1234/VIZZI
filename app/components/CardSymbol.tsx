import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';

type Props = {
  type: string;
  color: string;
  size?: number;
  opacity?: number;
};

export default function CardSymbol({ type, color, size = 60, opacity = 0.15 }: Props) {
  const props = { stroke: color, strokeWidth: 1.5, strokeLinecap: 'round' as any, strokeLinejoin: 'round' as any, fill: 'none', opacity };

  switch (type) {
    case 'barbershop':
      return (
        <Svg width={size} height={size} viewBox="0 0 60 60">
          <Line x1="10" y1="10" x2="50" y2="50" {...props} strokeWidth={2} />
          <Line x1="50" y1="10" x2="10" y2="50" {...props} strokeWidth={2} />
          <Circle cx="10" cy="10" r="5" {...props} />
          <Circle cx="50" cy="10" r="5" {...props} />
          <Circle cx="10" cy="50" r="5" {...props} />
          <Circle cx="50" cy="50" r="5" {...props} />
        </Svg>
      );
    case 'pharmacy':
      return (
        <Svg width={size} height={size} viewBox="0 0 60 60">
          <Rect x="22" y="8" width="16" height="44" rx="3" {...props} strokeWidth={2} />
          <Rect x="8" y="22" width="44" height="16" rx="3" {...props} strokeWidth={2} />
        </Svg>
      );
    case 'restaurant':
      return (
        <Svg width={size} height={size} viewBox="0 0 60 60">
          <Line x1="18" y1="8" x2="18" y2="30" {...props} strokeWidth={2} />
          <Path d="M12 8 Q12 22 18 22 Q24 22 24 8" {...props} strokeWidth={2} />
          <Line x1="18" y1="30" x2="18" y2="52" {...props} strokeWidth={2} />
          <Line x1="38" y1="8" x2="38" y2="52" {...props} strokeWidth={2} />
          <Path d="M32 8 Q32 28 38 28" {...props} strokeWidth={2} />
        </Svg>
      );
    case 'corporate':
      return (
        <Svg width={size} height={size} viewBox="0 0 60 60">
          <Path d="M30 8 L52 30 L30 52 L8 30 Z" {...props} strokeWidth={2} />
          <Path d="M30 16 L44 30 L30 44 L16 30 Z" {...props} strokeWidth={1} />
        </Svg>
      );
    case 'creative':
      return (
        <Svg width={size} height={size} viewBox="0 0 60 60">
          <Line x1="30" y1="8" x2="30" y2="52" {...props} strokeWidth={1.5} />
          <Line x1="8" y1="30" x2="52" y2="30" {...props} strokeWidth={1.5} />
          <Line x1="14" y1="14" x2="46" y2="46" {...props} strokeWidth={1.5} />
          <Line x1="46" y1="14" x2="14" y2="46" {...props} strokeWidth={1.5} />
          <Circle cx="30" cy="30" r="6" {...props} strokeWidth={1.5} />
        </Svg>
      );
    case 'clothing':
      return (
        <Svg width={size} height={size} viewBox="0 0 60 60">
          <Path d="M30 10 L20 10 L8 22 L18 28 L18 52 L42 52 L42 28 L52 22 L40 10 L30 10" {...props} strokeWidth={2} />
          <Path d="M30 10 Q26 18 30 20 Q34 18 30 10" {...props} strokeWidth={1.5} />
        </Svg>
      );
    case 'beauty':
      return (
        <Svg width={size} height={size} viewBox="0 0 60 60">
          <Path d="M30 10 Q42 20 42 32 Q42 46 30 52 Q18 46 18 32 Q18 20 30 10Z" {...props} strokeWidth={2} />
          <Path d="M30 18 Q38 26 38 34 Q38 44 30 48 Q22 44 22 34 Q22 26 30 18Z" {...props} strokeWidth={1} />
          <Line x1="30" y1="10" x2="30" y2="52" {...props} strokeWidth={1} />
        </Svg>
      );
    default:
      return (
        <Svg width={size} height={size} viewBox="0 0 60 60">
          <Circle cx="30" cy="30" r="22" {...props} strokeWidth={2} />
          <Circle cx="30" cy="30" r="12" {...props} strokeWidth={1} />
          <Circle cx="30" cy="30" r="3" {...props} strokeWidth={1} />
        </Svg>
      );
  }
}
