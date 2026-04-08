import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Dimensions, FlatList, KeyboardAvoidingView, Platform, ScrollView, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import CardPreview from './components/CardPreview';
import { useTheme } from './context/ThemeContext';
import { supabase } from './supabase';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 80;
const CARD_MARGIN = 10;

const cardTypes = [
  { id: 'personal', label: 'Personal', description: 'Your name and profession', icon: 'person-outline', color: '#FF5C87' },
  { id: 'business', label: 'Business', description: 'Your shop or place', icon: 'storefront-outline', color: '#3B82F6' },
];

const businessCategories = [
  { id: 'restaurant', label: 'Restaurant & Café', icon: 'restaurant-outline', color: '#FFBA00' },
  { id: 'corporate', label: 'Corporate & Banking', icon: 'briefcase-outline', color: '#3B82F6' },
  { id: 'creative', label: 'Creative & Freelance', icon: 'color-palette-outline', color: '#A855F7' },
  { id: 'shop', label: 'Shop', icon: 'bag-outline', color: '#FF5C87' },
  { id: 'other', label: 'Other', icon: 'ellipsis-horizontal-outline', color: '#555' },
];

const shopTypes = [
  { id: 'barbershop', label: 'Barbershop', colors: ['#1a1a1a', '#8B0000', '#2a0000', '#0a0a0a'] },
  { id: 'pharmacy', label: 'Pharmacy', colors: ['#059669', '#065f46', '#064e3b', '#f8f8f6'] },
  { id: 'clothing', label: 'Clothing', colors: ['#7C3AED', '#1a1a1a', '#f8f8f6', '#374151'] },
  { id: 'beauty', label: 'Beauty', colors: ['#DB2777', '#831843', '#fdf2f8', '#1a1a1a'] },
  { id: 'other', label: 'Other', colors: ['#374151', '#1a1a1a', '#f8f8f6', '#1E3A5F'] },
];

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

export default function Create() {
  const router = useRouter();
  const { colors } = useTheme();
  const flatListRef = useRef<FlatList>(null);
  const [step, setStep] = useState(1);
  const [cardType, setCardType] = useState('');
  const [category, setCategory] = useState('');
  const [shopType, setShopType] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [layoutIndex, setLayoutIndex] = useState(0);
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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCardName(user.user_metadata?.full_name || '');
        setEmail(user.email || '');
      }
    }
    getUser();
  }, []);

  const businessType = shopType || category;

  const availableColors = useMemo(() => {
    return cardType === 'personal'
      ? personalColors
      : (businessColorMap[businessType] || businessColorMap['other']);
  }, [cardType, businessType]);

  const previewColor = selectedColor || availableColors[0];
  const currentLayout = layouts[layoutIndex];
  const isFormValid = cardName.length > 0 && jobTitle.length > 0 && phone.length > 0 && email.length > 0;

  useEffect(() => {
    setLayoutIndex(0);
    setSelectedColor('');
    flatListRef.current?.scrollToIndex({ index: 0, animated: false });
  }, [businessType, cardType]);

  function goBack() {
    if (step === 1) router.back();
    else if (step === 2) setStep(1);
    else if (step === (2.5 as any)) setStep(2);
    else if (step === 3) {
      if (cardType === 'personal') setStep(1);
      else if (shopType) setStep(2.5 as any);
      else setStep(2);
    }
    else if (step === 4) setStep(3);
  }

  async function handleSave() {
    if (!isFormValid) return;
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase.from('cards').insert({
        user_id: user.id,
        name: cardName,
        job_title: jobTitle,
        phone,
        email,
        theme: previewColor,
        layout: currentLayout,
        business_type: businessType || 'other',
        instagram,
        linkedin,
        whatsapp,
        website,
        tiktok,
        address,
        is_public: isPublic,
      }).select().single();
      setLoading(false);
      if (data && !error) {
        router.push(`/card-ready?cardId=${data.id}` as any);
      } else {
        router.push('/home' as any);
      }
    } else {
      setLoading(false);
      router.push('/home' as any);
    }
  }

  function renderLayoutCard({ item }: { item: string }) {
    return (
      <View style={{ width: CARD_WIDTH, marginHorizontal: CARD_MARGIN }}>
        <CardPreview
          layout={item}
          color={previewColor}
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
          businessType={businessType || 'other'}
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

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={{ paddingTop: 60, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">

        <TouchableOpacity
          onPress={goBack}
          style={{ width: 36, height: 36, borderRadius: 10, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', marginBottom: 24, marginHorizontal: 24 }}>
          <Ionicons name="arrow-back" size={18} color={colors.textSecondary} />
        </TouchableOpacity>

        {/* STEP 1 */}
        {step === 1 && (
          <View style={{ paddingHorizontal: 24 }}>
            <Text style={{ color: colors.text, fontSize: 24, fontWeight: 'bold', marginBottom: 4 }}>Create a card</Text>
            <Text style={{ color: colors.textMuted, fontSize: 13, marginBottom: 32 }}>What type of card do you need?</Text>
            {cardTypes.map((type) => (
              <TouchableOpacity
                key={type.id}
                onPress={() => {
                  setCardType(type.id);
                  setSelectedColor('');
                  setLayoutIndex(0);
                  setShopType('');
                  setCategory('');
                  if (type.id === 'personal') setStep(3);
                  else setStep(2);
                }}
                style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border2, borderRadius: 16, padding: 16, marginBottom: 12 }}>
                <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: type.color + '22', alignItems: 'center', justifyContent: 'center', marginRight: 14 }}>
                  <Ionicons name={type.icon as any} size={22} color={type.color} />
                </View>
                <View>
                  <Text style={{ color: colors.text, fontSize: 15, fontWeight: 'bold' }}>{type.label}</Text>
                  <Text style={{ color: colors.textMuted, fontSize: 11, marginTop: 2 }}>{type.description}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <View style={{ paddingHorizontal: 24 }}>
            <Text style={{ color: colors.text, fontSize: 24, fontWeight: 'bold', marginBottom: 4 }}>Your business</Text>
            <Text style={{ color: colors.textMuted, fontSize: 13, marginBottom: 32 }}>What type of business is it?</Text>
            {businessCategories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                onPress={() => {
                  setCategory(cat.id);
                  setShopType('');
                  setSelectedColor('');
                  setLayoutIndex(0);
                  if (cat.id === 'shop') setStep(2.5 as any);
                  else setStep(3);
                }}
                style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border2, borderRadius: 16, padding: 16, marginBottom: 10 }}>
                <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: cat.color + '22', alignItems: 'center', justifyContent: 'center', marginRight: 14 }}>
                  <Ionicons name={cat.icon as any} size={20} color={cat.color} />
                </View>
                <Text style={{ color: colors.text, fontSize: 14, fontWeight: '500', flex: 1 }}>{cat.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* STEP 2.5 */}
        {step === (2.5 as any) && (
          <View style={{ paddingHorizontal: 24 }}>
            <Text style={{ color: colors.text, fontSize: 24, fontWeight: 'bold', marginBottom: 4 }}>Type of shop</Text>
            <Text style={{ color: colors.textMuted, fontSize: 13, marginBottom: 32 }}>What kind of shop is it?</Text>
            {shopTypes.map((type) => (
              <TouchableOpacity
                key={type.id}
                onPress={() => { setShopType(type.id); setSelectedColor(''); setLayoutIndex(0); setStep(3); }}
                style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border2, borderRadius: 16, padding: 16, marginBottom: 10 }}>
                <Text style={{ color: colors.text, fontSize: 14, fontWeight: '500', flex: 1 }}>{type.label}</Text>
                <View style={{ flexDirection: 'row', gap: 4 }}>
                  {type.colors.slice(0, 3).map((c, i) => (
                    <View key={i} style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: c, borderWidth: 1, borderColor: colors.border }} />
                  ))}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* STEP 3: Design */}
        {step === 3 && (
          <>
            <View style={{ paddingHorizontal: 24, marginBottom: 20 }}>
              <Text style={{ color: colors.text, fontSize: 24, fontWeight: 'bold', marginBottom: 4 }}>Design</Text>
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
                        borderWidth: previewColor === color ? 3 : 1.5,
                        borderColor: previewColor === color ? colors.primary : colors.border,
                      }}
                    />
                  ))}
                </View>
              </ScrollView>

              <TouchableOpacity
                onPress={() => setStep(4)}
                style={{ backgroundColor: colors.primary, padding: 16, borderRadius: 14, alignItems: 'center' }}>
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Continue</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* STEP 4: Details */}
        {step === 4 && (
          <View style={{ paddingHorizontal: 24 }}>
            <Text style={{ color: colors.text, fontSize: 24, fontWeight: 'bold', marginBottom: 4 }}>Your details</Text>
            <Text style={{ color: colors.textMuted, fontSize: 13, marginBottom: 24 }}>Fill in your information</Text>

            <CardPreview
              layout={currentLayout}
              color={previewColor}
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
              businessType={businessType || 'other'}
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
              onPress={handleSave}
              disabled={!isFormValid || loading}
              style={{ backgroundColor: colors.primary, padding: 16, borderRadius: 14, alignItems: 'center', opacity: (!isFormValid || loading) ? 0.4 : 1, marginBottom: 24 }}>
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>
                {loading ? 'Creating...' : 'Create card'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

      </ScrollView>
    </KeyboardAvoidingView>
  );
}