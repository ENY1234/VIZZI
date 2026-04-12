import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import BottomNav from './components/BottomNav';
import CardPreview from './components/CardPreview';
import { useTheme } from './context/ThemeContext';
import { supabase } from './supabase';

function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function Home() {
  const router = useRouter();
  const { colors } = useTheme();
  const [name, setName] = useState('');
  const [cards, setCards] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loadingCards, setLoadingCards] = useState(true);
  const [popularUsers, setPopularUsers] = useState<any[]>([]);
  const [nearbyUsers, setNearbyUsers] = useState<any[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [locationDenied, setLocationDenied] = useState(false);

  const cardColors = ['#FF5C87', '#3B82F6', '#10B981', '#FFBA00', '#A855F7', '#06b6d4'];

  useFocusEffect(
    useCallback(() => {
      loadData();
      requestLocation();
    }, [])
  );

  async function requestLocation() {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setLocationDenied(true);
      return;
    }
    const loc = await Location.getCurrentPositionAsync({});
    const lat = loc.coords.latitude;
    const lon = loc.coords.longitude;
    setUserLocation({ lat, lon });

    // Save location to profile
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('profiles').update({ latitude: lat, longitude: lon }).eq('id', user.id);
    }

    loadNearby(lat, lon);
  }

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const fullName = user.user_metadata?.full_name || 'there';
    setName(fullName.split(' ')[0]);

    setLoadingCards(true);
    const { data: myCards } = await supabase
      .from('cards')
      .select('*')
      .eq('user_id', user.id)
      .order('order', { ascending: true });
    if (myCards) setCards(myCards);
    setLoadingCards(false);

    // Load popular users — ranked by how many times their cards were saved
    const { data: savedData } = await supabase
      .from('saved_cards')
      .select('card_id, cards(user_id)')
      .neq('user_id', user.id);

    if (savedData) {
      // Count saves per user
      const saveCounts: Record<string, number> = {};
      savedData.forEach((sc: any) => {
        const uid = sc.cards?.user_id;
        if (uid) saveCounts[uid] = (saveCounts[uid] || 0) + 1;
      });

      const sortedUserIds = Object.entries(saveCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([uid]) => uid)
        .filter(uid => uid !== user.id)
        .slice(0, 10);

      if (sortedUserIds.length > 0) {
        // Only show users with public cards
        const { data: publicCards } = await supabase
          .from('cards')
          .select('user_id')
          .eq('is_public', true)
          .in('user_id', sortedUserIds);

        const publicUserIds = [...new Set(publicCards?.map((c: any) => c.user_id) || [])];

        if (publicUserIds.length > 0) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('*')
            .in('id', publicUserIds);
          if (profiles) {
            // Sort by save count
            const sorted = profiles.sort((a: any, b: any) =>
              (saveCounts[b.id] || 0) - (saveCounts[a.id] || 0)
            );
            setPopularUsers(sorted);
          }
        }
      }
    }
  }

  async function loadNearby(lat: number, lon: number) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get all profiles with location
    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .not('latitude', 'is', null)
      .not('longitude', 'is', null)
      .neq('id', user.id);

    if (!profiles) return;

    // Get users with public cards
    const { data: publicCards } = await supabase
      .from('cards')
      .select('user_id')
      .eq('is_public', true);

    const publicUserIds = new Set(publicCards?.map((c: any) => c.user_id) || []);

    // Filter by distance (within 10km) and public cards
    const nearby = profiles
      .filter((p: any) => publicUserIds.has(p.id))
      .map((p: any) => ({
        ...p,
        distance: getDistanceKm(lat, lon, p.latitude, p.longitude),
      }))
      .filter((p: any) => p.distance <= 10)
      .sort((a: any, b: any) => a.distance - b.distance)
      .slice(0, 10);

    setNearbyUsers(nearby);
  }

  const filteredPopular = search.length > 0
    ? popularUsers.filter(u =>
        u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        u.job_title?.toLowerCase().includes(search.toLowerCase())
      )
    : popularUsers;

  const filteredNearby = search.length > 0
    ? nearbyUsers.filter(u =>
        u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        u.job_title?.toLowerCase().includes(search.toLowerCase())
      )
    : nearbyUsers;

  function UserRow({ person, index, showDistance }: { person: any; index: number; showDistance?: boolean }) {
    return (
      <TouchableOpacity
        key={person.id}
        onPress={() => router.push(`/user-profile?userId=${person.id}` as any)}
        style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border2, borderRadius: 14, marginHorizontal: 20, marginBottom: 8, padding: 12 }}>
        {person.avatar_url ? (
          <Image source={{ uri: person.avatar_url }} style={{ width: 36, height: 36, borderRadius: 10, marginRight: 10 }} />
        ) : (
          <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: cardColors[index % cardColors.length], alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 11 }}>{person.full_name?.charAt(0)}</Text>
          </View>
        )}
        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.text, fontSize: 12, fontWeight: '500' }}>{person.full_name}</Text>
          <Text style={{ color: colors.textMuted, fontSize: 10, marginTop: 2 }}>{person.job_title || 'Vizzi user'}</Text>
        </View>
        {showDistance && person.distance != null && (
          <Text style={{ color: colors.textMuted, fontSize: 10, marginRight: 6 }}>
            {person.distance < 1 ? `${Math.round(person.distance * 1000)}m` : `${person.distance.toFixed(1)}km`}
          </Text>
        )}
        <Ionicons name="chevron-forward" size={16} color={colors.textFaint} />
      </TouchableOpacity>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 20 }}>

        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingTop: 60 }}>
          <View>
            <Text style={{ color: colors.textMuted, fontSize: 12 }}>Good morning,</Text>
            <Text style={{ color: colors.text, fontSize: 22, fontWeight: 'bold', marginTop: 2 }}>{name}</Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/profile' as any)}
            style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 14 }}>{name.charAt(0)}</Text>
          </TouchableOpacity>
        </View>

        {/* My cards */}
        <Text style={{ color: colors.textMuted, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', paddingHorizontal: 20, marginBottom: 10 }}>My cards</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}>
          {loadingCards ? (
            [1, 2].map((i) => (
              <View key={i} style={{ width: 160, height: 96, borderRadius: 16, backgroundColor: colors.surface }} />
            ))
          ) : cards.length === 0 ? (
            <TouchableOpacity
              onPress={() => router.push('/create' as any)}
              style={{ width: 200, height: 96, borderRadius: 16, backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.border, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: colors.textFaint, fontSize: 24 }}>+</Text>
              <Text style={{ color: colors.textFaint, fontSize: 9, marginTop: 4 }}>Create your first card</Text>
            </TouchableOpacity>
          ) : (
            <>
              {cards.map((card) => (
                <TouchableOpacity
                  key={card.id}
                  onPress={() => router.push(`/card-ready?cardId=${card.id}&from=home` as any)}>
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
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                onPress={() => router.push('/create' as any)}
                style={{ width: 80, height: 96, borderRadius: 16, backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.border, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: colors.textFaint, fontSize: 24 }}>+</Text>
                <Text style={{ color: colors.textFaint, fontSize: 9, marginTop: 4 }}>New</Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>

        {/* Discover */}
        <Text style={{ color: colors.textMuted, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', paddingHorizontal: 20, marginTop: 24, marginBottom: 10 }}>Discover</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 12, marginHorizontal: 20, paddingHorizontal: 12, marginBottom: 20 }}>
          <Ionicons name="search-outline" size={16} color={colors.textFaint} />
          <TextInput
            placeholder="Search by name or job title..."
            placeholderTextColor={colors.textFaint}
            value={search}
            onChangeText={setSearch}
            style={{ flex: 1, color: colors.text, padding: 10, fontSize: 12 }} />
        </View>

        {/* Popular */}
        {filteredPopular.length > 0 && (
          <>
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 8 }}>
              <Ionicons name="flame-outline" size={13} color={colors.primary} />
              <Text style={{ color: colors.textMuted, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', marginLeft: 5 }}>Popular</Text>
            </View>
            {filteredPopular.map((person, index) => (
              <UserRow key={person.id} person={person} index={index} />
            ))}
          </>
        )}

        {/* Near Me */}
        {!locationDenied && (
          <>
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginTop: filteredPopular.length > 0 ? 16 : 0, marginBottom: 8 }}>
              <Ionicons name="location-outline" size={13} color={colors.primary} />
              <Text style={{ color: colors.textMuted, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', marginLeft: 5 }}>Near me</Text>
            </View>
            {filteredNearby.length > 0 ? (
              filteredNearby.map((person, index) => (
                <UserRow key={person.id} person={person} index={index} showDistance />
              ))
            ) : (
              <Text style={{ color: colors.textMuted, fontSize: 12, paddingHorizontal: 20, textAlign: 'center', marginTop: 8 }}>
                No one nearby yet
              </Text>
            )}
          </>
        )}

        {locationDenied && filteredPopular.length === 0 && (
          <Text style={{ color: colors.textMuted, fontSize: 12, paddingHorizontal: 20, marginTop: 8, textAlign: 'center' }}>
            No users found
          </Text>
        )}

      </ScrollView>
      <BottomNav active="home" />
    </View>
  );
}