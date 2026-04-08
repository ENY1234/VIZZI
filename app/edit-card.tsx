import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Dimensions, FlatList, KeyboardAvoidingView, Platform, ScrollView, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import CardPreview from './components/CardPreview';
import { useTheme } from './context/ThemeContext';
import { supabase } from './supabase';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 80;
const CARD_MARGIN = 10;

const personalColors = [
  '#FF5C87', '#3B82F6', '#10B981', '#1a1a1a',
  '#FFBA00', '#06b6d4', '#FB7185', '#8B5CF6',
  '#F97316', '#34D399', '#ffffff', '#1E3A5F',
];

const businessColorMap: Record<string, string[]> = {
  barbershop: ['#1a1a1a', '#8B0000', '#2a0000', '#0a0a0a'],
  pharmacy: ['#059669', '#065f46', '#064e3b', '#f8f8f6'],
  clothing: ['#7C3AED', '#1a1a1a', '#f8f8f6', '#374151'],
  beauty: ['#DB2777', '#831843', '#fdf2f8', '#1a1a1a'],
  restaurant: ['#B45309', '#1a1a1a', '#fef3c7', '#064e3b'],
  corporate: ['#1E3A5F', '#1a1a1a', '#f8f8f6', '#374151'],
  creative: ['#7C3AED', '#FF5C87', '#1a1a1a', '#06b6d4'],
  other: ['#374151', '#1a1a1a', '#f8f8f6', '#1E3A5F'],
};

const layouts = ['classic', 'minimal', 'dark', 'elegant', 'bold', 'simple'];
const layoutLabels: Record<string, string> = {
  classic: 'Classic', minimal: 'Minimal', dark: 'Dark',
  elegant: 'Elegant', bold: 'Bold', simple: 'Simple',
};

export default function EditCard() {
  const router = useRouter();
  const { colors } = useTheme();
  const { cardId } = useLocalSearchParams();
  const flatListRef = useRef<FlatList>(null);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [selectedColor, setSelectedColor] = useState('#FF5C87');
  const [layoutIndex, setLayoutIndex] = useState(0);
  const [businessType, setBusinessType] = useState('other');
  const [cardName, setCardName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [instagram, setInstagram] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [website, setWebsite] = useState('');
  const [tiktok, setTiktok] = useState('');
  const [isPublic, setIsPublic] = useState(true);

  useEffect(() => {
    async function loadCard() {
      if (!cardId) return;
      const { data } = await supabase.from('cards').select('*').eq('id', cardId).single();
      if (data) {
        setSelectedColor(data.theme || '#FF5C87');
        setLayoutIndex(layouts.indexOf(data.layout || 'classic'));
        setBusinessType(data.business_type || 'other');
        setCardName(data.name || '');
        setJobTitle(data.job_title || '');
        setPhone(data.phone || '');
        setEmail(data.email || '');
        setAddress(data.address || '');
        setInstagram(data.instagram || '');
        setLinkedin(data.linkedin || '');
        setWhatsapp(data.whatsapp || '');
        setWebsite(data.website || '');
        setTiktok(data.tiktok || '');
        setIsPublic(data.is_public ?? true);
      }
      setFetching(false);
    }
    loadCard();
  }, [cardId]);

  const availableColors = useMemo(() => {
    return businessColorMap[businessType] || personalColors;
  }, [businessType]);

  const currentLayout = layouts[layoutIndex];
  const isFormValid = cardName.length > 0 && jobTitle.length > 0 && phone.length > 0 && email.length > 0;

  async function handleUpdate() {
    if (!isFormValid) return;
    setLoading(true);
    const { error } = await supabase.from('cards').update({
      name: cardName,
      job_title: jobTitle,
      phone,
      email,
      theme: selectedColor,
      layout: currentLayout,
      business_type: businessType,
      instagram,
      linkedin,
      whatsapp,
      website,
      tiktok,
      address,
      is_public: isPublic,
    }).eq('id', cardId);
    setLoading(false);
    if (!error) {
      router.push(`/card-ready?cardId=${cardId}` as any);
    }
  }

  function renderLayoutCard({ item }: { item: string }) {
    return (
      <View style={{ width: CARD_WIDTH, marginHorizontal: CARD_MARGIN }}>
        <CardPreview
          layout={item}
          color={selectedColor}
          name={cardName}
          role={jobTitle}
          phone={phone}
          email={email}
          address={address}
          instagram={instagram}
          linkedin={linkedin}
          whatsapp={whatsapp}
          website={website}
          tiktok={tiktok}
          businessType={businessType}
        />
        <Text style={{ color: colors.textMuted, fontSize: 11, textAlign: 'center', marginTop: 8 }}>
          {layoutLabels[item]}
        </Text>
      </View>
    );
  }

  const inputStyle = {
    backgroundColor: colors.surface,
    color: colors.text as any,
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  };

  if (fetching) return (
    <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: colors.textMuted }}>Loading...</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={{ paddingTop: 60, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">

        <TouchableOpacity
          onPress={() => step === 1 ? router.back() : setStep(step - 1)}
          style={{ width: 36, height: 36, borderRadius: 10, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', marginBottom: 24, marginHorizontal: 24 }}>
          <Ionicons name="arrow-back" size={18} color={colors.textSecondary} />
        </TouchableOpacity>

        {/* STEP 1: Design */}
        {step === 1 && (
          <>
            <View style={{ paddingHorizontal: 24, marginBottom: 20 }}>
              <Text style={{ color: colors.text, fontSize: 24, fontWeight: 'bold', marginBottom: 4 }}>Edit design</Text>
              <Text style={{ color: colors.textMuted, fontSize: 13 }}>Swipe to browse layouts</Text>
            </View>

            <FlatList
              ref={flatListRef}
              data={layouts}
              renderItem={renderLayoutCard}
              keyExtractor={(item) => item}
              horizontal
              showsHorizontalScrollIndicator={false}
              snapToInterval={CARD_WIDTH + CARD_MARGIN * 2}
              decelerationRate="fast"
              contentContainerStyle={{ paddingHorizontal: 24 }}
              initialScrollIndex={layoutIndex}
              onMomentumScrollEnd={(e) => {
                const index = Math.round(e.nativeEvent.contentOffset.x / (CARD_WIDTH + CARD_MARGIN * 2));
                setLayoutIndex(index);
              }}
              getItemLayout={(_, index) => ({
                length: CARD_WIDTH + CARD_MARGIN * 2,
                offset: (CARD_WIDTH + CARD_MARGIN * 2) * index,
                index,
              })}
            />

            <View style={{ flexDirection: 'row', gap: 5, justifyContent: 'center', marginTop: 12, marginBottom: 24 }}>
              {layouts.map((_, i) => (
                <TouchableOpacity key={i} onPress={() => {
                  setLayoutIndex(i);
                  flatListRef.current?.scrollToIndex({ index: i, animated: true });
                }}>
                  <View style={{ width: i === layoutIndex ? 20 : 6, height: 6, borderRadius: 3, backgroundColor: i === layoutIndex ? colors.primary : colors.border }} />
                </TouchableOpacity>
              ))}
            </View>

            <View style={{ paddingHorizontal: 24 }}>
              <Text style={{ color: colors.textMuted, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 }}>Color</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 28 }}>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  {availableColors.map((color, i) => (
                    <TouchableOpacity
                      key={i}
                      onPress={() => setSelectedColor(color)}
                      style={{
                        width: 36, height: 36, borderRadius: 18,
                        backgroundColor: color,
                        borderWidth: selectedColor === color ? 3 : 1.5,
                        borderColor: selectedColor === color ? colors.primary : colors.border,
                      }}
                    />
                  ))}
                </View>
              </ScrollView>

              <TouchableOpacity
                onPress={() => setStep(2)}
                style={{ backgroundColor: colors.primary, padding: 16, borderRadius: 14, alignItems: 'center' }}>
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Continue</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* STEP 2: Details */}
        {step === 2 && (
          <View style={{ paddingHorizontal: 24 }}>
            <Text style={{ color: colors.text, fontSize: 24, fontWeight: 'bold', marginBottom: 4 }}>Edit details</Text>
            <Text style={{ color: colors.textMuted, fontSize: 13, marginBottom: 24 }}>Update your information</Text>

            <CardPreview
              layout={currentLayout}
              color={selectedColor}
              name={cardName}
              role={jobTitle}
              phone={phone}
              email={email}
              address={address}
              instagram={instagram}
              linkedin={linkedin}
              whatsapp={whatsapp}
              website={website}
              tiktok={tiktok}
              businessType={businessType}
            />

            <Text style={{ color: colors.textMuted, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10, marginTop: 16 }}>Essential</Text>

            <TextInput value={cardName} onChangeText={setCardName} placeholder="Full name or business name" placeholderTextColor={colors.textMuted} returnKeyType="done" blurOnSubmit={true} style={{ ...inputStyle, borderColor: cardName ? colors.border : colors.danger + '33' }} />
            <TextInput value={jobTitle} onChangeText={setJobTitle} placeholder="Job title or business type" placeholderTextColor={colors.textMuted} returnKeyType="done" blurOnSubmit={true} style={{ ...inputStyle, borderColor: jobTitle ? colors.border : colors.danger + '33' }} />
            <TextInput value={phone} onChangeText={setPhone} placeholder="+212 6 00 00 00 00" placeholderTextColor={colors.textMuted} keyboardType="phone-pad" returnKeyType="done" blurOnSubmit={true} style={{ ...inputStyle, marginBottom: 4, borderColor: phone ? colors.border : colors.danger + '33' }} />
            <Text style={{ color: colors.textFaint, fontSize: 10, marginBottom: 10, marginLeft: 4 }}>Include country code for international use</Text>
            <TextInput value={email} onChangeText={setEmail} placeholder="Email" placeholderTextColor={colors.textMuted} keyboardType="email-address" returnKeyType="done" blurOnSubmit={true} style={{ ...inputStyle, borderColor: email ? colors.border : colors.danger + '33' }} />

            <Text style={{ color: colors.textMuted, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10, marginTop: 14 }}>Optional</Text>
            <TextInput value={address} onChangeText={setAddress} placeholder="Address" placeholderTextColor={colors.textMuted} returnKeyType="done" blurOnSubmit={true} style={inputStyle} />
            <TextInput value={instagram} onChangeText={setInstagram} placeholder="Instagram username" placeholderTextColor={colors.textMuted} returnKeyType="done" blurOnSubmit={true} style={inputStyle} />
            <TextInput value={linkedin} onChangeText={setLinkedin} placeholder="LinkedIn profile" placeholderTextColor={colors.textMuted} returnKeyType="done" blurOnSubmit={true} style={inputStyle} />
            <TextInput value={whatsapp} onChangeText={setWhatsapp} placeholder="WhatsApp number" placeholderTextColor={colors.textMuted} keyboardType="phone-pad" returnKeyType="done" blurOnSubmit={true} style={inputStyle} />
            <TextInput value={tiktok} onChangeText={setTiktok} placeholder="TikTok username" placeholderTextColor={colors.textMuted} returnKeyType="done" blurOnSubmit={true} style={inputStyle} />
            <TextInput value={website} onChangeText={setWebsite} placeholder="Website" placeholderTextColor={colors.textMuted} returnKeyType="done" blurOnSubmit={true} style={{ ...inputStyle, marginBottom: 16 }} />

            {/* Public/Private toggle */}
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 14, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: colors.border }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.text, fontSize: 14, fontWeight: '600' }}>
                  {isPublic ? 'Public card' : 'Private card'}
                </Text>
                <Text style={{ color: colors.textMuted, fontSize: 11, marginTop: 2 }}>
                  {isPublic ? 'Everyone can discover this card' : 'Only you can share this card'}
                </Text>
              </View>
              <Switch
                value={isPublic}
                onValueChange={setIsPublic}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#fff"
              />
            </View>

            {!isFormValid && (
              <Text style={{ color: colors.danger, fontSize: 11, marginBottom: 10, textAlign: 'center' }}>
                Please fill in all essential fields
              </Text>
            )}

            <TouchableOpacity
              onPress={handleUpdate}
              disabled={!isFormValid || loading}
              style={{ backgroundColor: colors.primary, padding: 16, borderRadius: 14, alignItems: 'center', opacity: (!isFormValid || loading) ? 0.4 : 1, marginBottom: 24 }}>
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>
                {loading ? 'Saving...' : 'Save changes'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

      </ScrollView>
    </KeyboardAvoidingView>
  );
}