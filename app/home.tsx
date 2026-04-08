import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import BottomNav from './components/BottomNav';
import CardPreview from './components/CardPreview';
import { useTheme } from './context/ThemeContext';
import { supabase } from './supabase';

export default function Home() {
  const router = useRouter();
  const { colors } = useTheme();
  const [name, setName] = useState('');
  const [cards, setCards] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loadingCards, setLoadingCards] = useState(true);

  const cardColors = ['#FF5C87', '#3B82F6', '#10B981', '#FFBA00', '#A855F7', '#06b6d4'];

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
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

      const { data: publicCards } = await supabase
        .from('cards')
        .select('user_id')
        .eq('is_public', true)
        .neq('user_id', user.id);

      if (publicCards) {
        const uniqueUserIds = [...new Set(publicCards.map(c => c.user_id))];
        if (uniqueUserIds.length > 0) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('*')
            .in('id', uniqueUserIds);
          if (profiles) setUsers(profiles);
        } else {
          setUsers([]);
        }
      }
    }
  }

  const filteredUsers = search.length > 0
    ? users.filter(u =>
        u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        u.job_title?.toLowerCase().includes(search.toLowerCase())
      )
    : users;

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
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 12, marginHorizontal: 20, paddingHorizontal: 12, marginBottom: 12 }}>
          <Ionicons name="search-outline" size={16} color={colors.textFaint} />
          <TextInput
            placeholder="Search by name or job title..."
            placeholderTextColor={colors.textFaint}
            value={search}
            onChangeText={setSearch}
            style={{ flex: 1, color: colors.text, padding: 10, fontSize: 12 }} />
        </View>

        {search.length === 0 && users.length > 0 && (
          <Text style={{ color: colors.textMuted, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', paddingHorizontal: 20, marginBottom: 8 }}>Suggestions</Text>
        )}

        {search.length === 0 && users.length === 0 && (
          <Text style={{ color: colors.textMuted, fontSize: 12, paddingHorizontal: 20, marginTop: 8, textAlign: 'center' }}>
            No other users yet
          </Text>
        )}

        {search.length > 0 && filteredUsers.length === 0 && (
          <Text style={{ color: colors.textMuted, fontSize: 12, paddingHorizontal: 20, marginTop: 8 }}>No results found</Text>
        )}

        {filteredUsers.map((person, index) => (
          <TouchableOpacity
            key={person.id}
            onPress={() => router.push(`/user-profile?userId=${person.id}` as any)}
            style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border2, borderRadius: 14, marginHorizontal: 20, marginBottom: 8, padding: 12 }}>
            {person.avatar_url ? (
              <Image
                source={{ uri: person.avatar_url }}
                style={{ width: 36, height: 36, borderRadius: 10, marginRight: 10 }}
              />
            ) : (
              <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: cardColors[index % cardColors.length], alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 11 }}>{person.full_name?.charAt(0)}</Text>
              </View>
            )}
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.text, fontSize: 12, fontWeight: '500' }}>{person.full_name}</Text>
              <Text style={{ color: colors.textMuted, fontSize: 10, marginTop: 2 }}>{person.job_title || 'Vizzi user'}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.textFaint} />
          </TouchableOpacity>
        ))}

      </ScrollView>
      <BottomNav active="home" />
    </View>
  );
}