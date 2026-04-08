import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';

type Props = { color: string; size?: number; opacity?: number; };

export function PhoneIcon({ color, size = 14, opacity = 1 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8a19.79 19.79 0 01-3.07-8.68A2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity={opacity}/>
    </Svg>
  );
}

export function EmailIcon({ color, size = 14, opacity = 1 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="2" y="4" width="20" height="16" rx="2" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity={opacity}/>
      <Path d="M22 7l-10 7L2 7" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity={opacity}/>
    </Svg>
  );
}

export function LocationIcon({ color, size = 14, opacity = 1 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity={opacity}/>
      <Circle cx="12" cy="10" r="3" stroke={color} strokeWidth="1.5" opacity={opacity}/>
    </Svg>
  );
}

export function InstagramIcon({ color, size = 14, opacity = 1 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="2" y="2" width="20" height="20" rx="5" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity={opacity}/>
      <Circle cx="12" cy="12" r="4" stroke={color} strokeWidth="1.5" opacity={opacity}/>
      <Circle cx="17.5" cy="6.5" r="0.5" fill={color} opacity={opacity}/>
    </Svg>
  );
}

export function LinkedinIcon({ color, size = 14, opacity = 1 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="2" y="2" width="20" height="20" rx="4" stroke={color} strokeWidth="1.5" opacity={opacity}/>
      <Line x1="8" y1="11" x2="8" y2="17" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity={opacity}/>
      <Line x1="8" y1="8" x2="8" y2="8.5" stroke={color} strokeWidth="2" strokeLinecap="round" opacity={opacity}/>
      <Path d="M12 17v-4a2 2 0 014 0v4" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity={opacity}/>
      <Line x1="12" y1="11" x2="12" y2="17" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity={opacity}/>
    </Svg>
  );
}

export function WhatsappIcon({ color, size = 14, opacity = 1 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity={opacity}/>
    </Svg>
  );
}

export function WebsiteIcon({ color, size = 14, opacity = 1 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.5" opacity={opacity}/>
      <Path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity={opacity}/>
    </Svg>
  );
}

export function TiktokIcon({ color, size = 14, opacity = 1 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M9 12a4 4 0 104 4V4a5 5 0 005 5" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity={opacity}/>
    </Svg>
  );
}