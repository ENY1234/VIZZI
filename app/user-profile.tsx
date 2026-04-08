import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import CardPreview from './components/CardPreview';
import SaveToGroupModal from './components/SaveToGroupModal';
import { useTheme } from './context/ThemeContext';
import { supabase } from './supabase';

export default function UserProfile() {
  const router = useRouter();
  const { colors } = useTheme();
  const { userId } = useLocalSearchParams();
  const [profile, setProfile] = useState<any>(null);
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCard, setSelectedCard] = useState<any>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);

  useEffect(() => {
    loadUserProfile();
  }, [userId]);

  async function loadUserProfile() {
    const { data: prof } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (prof) setProfile(prof);

    // Only show public cards
    const { data: userCards } = await supabase
      .from('cards')
      .select('*')
      .eq('user_id', userId)
      .eq('is_public', true);
    if (userCards) setCards(userCards);

    setLoading(false);
  }

  const name = profile?.full_name || 'Vizzi user';
  const initials = name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  const photo = profile?.avatar_url || null;

  if (loading) return (
    <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: colors.textMuted }}>Loading...</Text>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: 24, paddingTop: 60, paddingBottom: 40 }}>

        <TouchableOpacity
          onPress={() => router.back()}
          style={{ width: 36, height: 36, borderRadius: 10, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', marginBottom: 28 }}>
          <Ionicons name="arrow-back" size={18} color={colors.textSecondary} />
        </TouchableOpacity>

        {/* Profile info */}
        <View style={{ alignItems: 'center', marginBottom: 32 }}>
          {photo ? (
            <Image
              source={{ uri: photo }}
              style={{ width: 80, height: 80, borderRadius: 40, marginBottom: 16 }}
            />
          ) : (
            <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <Text style={{ color: '#fff', fontSize: 28, fontWeight: 'bold' }}>{initials}</Text>
            </View>
          )}
          <Text style={{ color: colors.text, fontSize: 22, fontWeight: 'bold' }}>{name}</Text>
          {profile?.job_title ? (
            <Text style={{ color: colors.primary, fontSize: 13, marginTop: 4 }}>{profile.job_title}</Text>
          ) : null}
          {profile?.bio ? (
            <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 10, textAlign: 'center', lineHeight: 20 }}>{profile.bio}</Text>
          ) : null}
        </View>

        {/* Public cards count */}
        <Text style={{ color: colors.textMuted, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 16 }}>
          {cards.length} public {cards.length === 1 ? 'card' : 'cards'}
        </Text>

        {cards.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: 40 }}>
            <Ionicons name="card-outline" size={40} color={colors.textFaint} />
            <Text style={{ color: colors.textMuted, fontSize: 13, marginTop: 12 }}>No public cards yet</Text>
          </View>
        ) : (
          cards.map((card) => (
            <View key={card.id} style={{ marginBottom: 20 }}>
              <CardPreview
                layout={card.layout || 'classic'}
                color={card.theme || '#FF5C87'}
                name={card.name}
                role={card.job_title}
                phone={card.phone}
                email={card.email}
                address={card.address}
                instagram={card.instagram}
                linkedin={card.linkedin}
                whatsapp={card.whatsapp}
                website={card.website}
                tiktok={card.tiktok}
                businessType={card.business_type || 'other'}
              />
              <TouchableOpacity
                onPress={() => { setSelectedCard(card); setShowSaveModal(true); }}
                style={{ marginTop: 8, padding: 12, borderRadius: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <Ionicons name="people-outline" size={16} color={colors.primary} />
                <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '600' }}>Save to group</Text>
              </TouchableOpacity>
            </View>
          ))
        )}

      </ScrollView>

      <SaveToGroupModal
        visible={showSaveModal}
        cardId={selectedCard?.id}
        cardName={selectedCard?.name}
        onClose={() => setShowSaveModal(false)}
        onSaved={(groupId) => {
          setShowSaveModal(false);
          router.push({ pathname: '/group-detail', params: { groupId } } as any);
        }}
      />
    </View>
  );
}