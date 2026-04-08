import { Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import CardSymbol from './CardSymbol';
import { EmailIcon, InstagramIcon, LinkedinIcon, LocationIcon, PhoneIcon, TiktokIcon, WebsiteIcon, WhatsappIcon } from './ContactIcons';

type Props = {
  layout: string;
  color: string;
  name: string;
  role: string;
  phone?: string;
  email?: string;
  address?: string;
  instagram?: string;
  linkedin?: string;
  whatsapp?: string;
  website?: string;
  tiktok?: string;
  businessType?: string;
};

// New improved light checker
function isCardColorLight(color: string) {
  if (['#f8f8f6', '#ffffff', '#fff', '#fef3c7', '#fdf2f8'].includes(color)) return true;

  if (color.startsWith('#')) {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.85;
  }
  return false;
}

function ContactRow({ value, icon, iconColor }: { value?: string; icon: any; iconColor: string }) {
  if (!value) return null;
  const Icon = icon;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 }}>
      <Icon color={iconColor} size={10} opacity={0.6} />
      <Text style={{ color: iconColor, fontSize: 8, opacity: 0.7 }}>{value}</Text>
    </View>
  );
}

function hasContacts(props: Props) {
  return props.phone || props.email || props.address || props.instagram || props.linkedin || props.whatsapp || props.website || props.tiktok;
}

export default function CardPreview(props: Props) {
  const { layout, color, name, role, phone, email, address, instagram, linkedin, whatsapp, website, tiktok, businessType } = props;

  const { isDark } = useTheme(); // <-- theme mode here

  const isLight = isCardColorLight(color);
  const textColor = isLight ? '#111' : '#fff';
  const subColor = isLight ? '#666' : 'rgba(255,255,255,0.6)';
  const symbolColor = isLight ? '#000' : '#fff';
  const iconColor = isLight ? '#333' : '#fff';

  const displayName = name || 'Your name';
  const displayRole = role || 'Job title';
  const hasInfo = hasContacts(props);

  // Border logic
  const borderWidth = !isDark && isLight ? 1 : 0;

  const contactInfo = (
    <View style={{ marginTop: 6 }}>
      <ContactRow value={phone} icon={PhoneIcon} iconColor={iconColor} />
      <ContactRow value={email} icon={EmailIcon} iconColor={iconColor} />
      <ContactRow value={address} icon={LocationIcon} iconColor={iconColor} />
      <ContactRow value={instagram} icon={InstagramIcon} iconColor={iconColor} />
      <ContactRow value={tiktok} icon={TiktokIcon} iconColor={iconColor} />
      <ContactRow value={linkedin} icon={LinkedinIcon} iconColor={iconColor} />
      <ContactRow value={whatsapp} icon={WhatsappIcon} iconColor={iconColor} />
      <ContactRow value={website} icon={WebsiteIcon} iconColor={iconColor} />
    </View>
  );

  const darkContactInfo = (
    <View style={{ marginTop: 6 }}>
      <ContactRow value={phone} icon={PhoneIcon} iconColor={color} />
      <ContactRow value={email} icon={EmailIcon} iconColor={color} />
      <ContactRow value={address} icon={LocationIcon} iconColor={color} />
      <ContactRow value={instagram} icon={InstagramIcon} iconColor={color} />
      <ContactRow value={tiktok} icon={TiktokIcon} iconColor={color} />
      <ContactRow value={linkedin} icon={LinkedinIcon} iconColor={color} />
      <ContactRow value={whatsapp} icon={WhatsappIcon} iconColor={color} />
      <ContactRow value={website} icon={WebsiteIcon} iconColor={color} />
    </View>
  );

  const simpleContactInfo = (
    <View style={{ marginTop: 6 }}>
      <ContactRow value={phone} icon={PhoneIcon} iconColor="#555" />
      <ContactRow value={email} icon={EmailIcon} iconColor="#555" />
      <ContactRow value={address} icon={LocationIcon} iconColor="#555" />
      <ContactRow value={instagram} icon={InstagramIcon} iconColor="#555" />
      <ContactRow value={tiktok} icon={TiktokIcon} iconColor="#555" />
      <ContactRow value={linkedin} icon={LinkedinIcon} iconColor="#555" />
      <ContactRow value={whatsapp} icon={WhatsappIcon} iconColor="#555" />
      <ContactRow value={website} icon={WebsiteIcon} iconColor="#555" />
    </View>
  );

  const baseStyle = {
    width: '100%' as any,
    borderRadius: 20,
    padding: 20,
    justifyContent: 'space-between' as any,
    borderWidth,
    borderColor: '#e0e0e0',
  };

  // Layouts below are unchanged except benefiting from auto-border

  if (layout === 'classic') {
    return (
      <View style={{ ...baseStyle, backgroundColor: color, minHeight: hasInfo ? undefined : 160 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <Text style={{ color: symbolColor, opacity: 0.25, fontSize: 10, fontWeight: 'bold', letterSpacing: 1 }}>VIZZI</Text>
          {businessType && <CardSymbol type={businessType} color={symbolColor} size={44} opacity={0.15} />}
        </View>
        <View>
          <Text style={{ color: textColor, fontWeight: 'bold', fontSize: 20 }}>{displayName}</Text>
          <Text style={{ color: subColor, fontSize: 11, marginTop: 3 }}>{displayRole}</Text>
          {contactInfo}
        </View>
      </View>
    );
  }

  if (layout === 'minimal') {
    return (
      <View
        style={{
          ...baseStyle,
          backgroundColor: color,
          paddingLeft: 24,
          borderLeftWidth: 5,
          borderLeftColor: isLight ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.25)',
          minHeight: hasInfo ? undefined : 160,
        }}
      >
        <Text style={{ color: symbolColor, opacity: 0.2, fontSize: 10, fontWeight: 'bold', letterSpacing: 1, marginBottom: 16 }}>VIZZI</Text>
        <View>
          <Text style={{ color: textColor, fontWeight: 'bold', fontSize: 20 }}>{displayName}</Text>
          <Text style={{ color: subColor, fontSize: 11, marginTop: 3 }}>{displayRole}</Text>
          {contactInfo}
        </View>
      </View>
    );
  }

  if (layout === 'dark') {
    return (
      <View style={{ ...baseStyle, backgroundColor: '#0a0a0a', minHeight: hasInfo ? undefined : 160 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <Text style={{ color: '#333', fontSize: 10, fontWeight: 'bold', letterSpacing: 1 }}>VIZZI</Text>
          {businessType && <CardSymbol type={businessType} color={color} size={44} opacity={0.6} />}
        </View>
        <View>
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 20 }}>{displayName}</Text>
          <Text style={{ color: color, fontSize: 11, marginTop: 3 }}>{displayRole}</Text>
          {darkContactInfo}
        </View>
      </View>
    );
  }

  if (layout === 'elegant') {
    return (
      <View style={{ ...baseStyle, backgroundColor: color, minHeight: hasInfo ? undefined : 160 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <Text style={{ color: symbolColor, opacity: 0.2, fontSize: 10, fontWeight: 'bold', letterSpacing: 1 }}>VIZZI</Text>
          {businessType && <CardSymbol type={businessType} color={symbolColor} size={44} opacity={0.1} />}
        </View>
        <View>
          <Text style={{ color: textColor, fontWeight: 'bold', fontSize: 20, fontStyle: 'italic' }}>{displayName}</Text>
          <View style={{ width: 28, height: 1, backgroundColor: isLight ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.3)', marginVertical: 6 }} />
          <Text style={{ color: subColor, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase' }}>{displayRole}</Text>
          {contactInfo}
        </View>
      </View>
    );
  }

  if (layout === 'bold') {
    return (
      <View style={{ ...baseStyle, backgroundColor: color, minHeight: hasInfo ? undefined : 160 }}>
        <View style={{ position: 'absolute', top: 0, right: 0, opacity: 0.06 }}>
          {businessType && <CardSymbol type={businessType} color={symbolColor} size={160} opacity={1} />}
        </View>
        <Text style={{ color: symbolColor, opacity: 0.2, fontSize: 10, fontWeight: 'bold', letterSpacing: 1, marginBottom: 16 }}>VIZZI</Text>
        <View>
          <Text style={{ color: textColor, fontWeight: 'bold', fontSize: 22 }}>{displayName}</Text>
          <Text style={{ color: subColor, fontSize: 11, marginTop: 4 }}>{displayRole}</Text>
          {contactInfo}
        </View>
      </View>
    );
  }

  if (layout === 'blanc') {
    return (
      <View
        style={{
          ...baseStyle,
          backgroundColor: '#f8f8f6',
          borderWidth: 1,
          borderColor: '#e0e0d8',
          minHeight: hasInfo ? undefined : 160,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <Text style={{ color: '#111', opacity: 0.2, fontSize: 10, fontWeight: 'bold', letterSpacing: 1 }}>VIZZI</Text>
          {businessType && <CardSymbol type={businessType} color="#111" size={44} opacity={0.12} />}
        </View>
        <View>
          <Text style={{ color: '#111', fontWeight: 'bold', fontSize: 20 }}>{displayName}</Text>
          <Text style={{ color: '#666', fontSize: 11, marginTop: 3 }}>{displayRole}</Text>
          <View style={{ marginTop: 6 }}>
            <ContactRow value={phone} icon={PhoneIcon} iconColor="#333" />
            <ContactRow value={email} icon={EmailIcon} iconColor="#333" />
            <ContactRow value={address} icon={LocationIcon} iconColor="#333" />
            <ContactRow value={instagram} icon={InstagramIcon} iconColor="#333" />
            <ContactRow value={tiktok} icon={TiktokIcon} iconColor="#333" />
            <ContactRow value={linkedin} icon={LinkedinIcon} iconColor="#333" />
            <ContactRow value={whatsapp} icon={WhatsappIcon} iconColor="#333" />
            <ContactRow value={website} icon={WebsiteIcon} iconColor="#333" />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={{ ...baseStyle, backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: '#2a2a2a', minHeight: hasInfo ? undefined : 160 }}>
      <Text style={{ color: '#333', fontSize: 10, fontWeight: 'bold', letterSpacing: 1, marginBottom: 16 }}>VIZZI</Text>
      <View>
        <Text style={{ color: color, fontWeight: 'bold', fontSize: 20 }}>{displayName}</Text>
        <Text style={{ color: '#555', fontSize: 11, marginTop: 3 }}>{displayRole}</Text>
        {simpleContactInfo}
      </View>
    </View>
  );
}