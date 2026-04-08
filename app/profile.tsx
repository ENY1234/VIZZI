import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import BottomNav from './components/BottomNav';
import { useTheme } from './context/ThemeContext';
import { supabase } from './supabase';

export default function Profile() {
  const router = useRouter();
  const { colors } = useTheme();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({ cards: 0, groups: 0, saved: 0 });

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [])
  );

  async function loadProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setUser(user);
    const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (prof) setProfile(prof);
    const { data: cards } = await supabase.from('cards').select('id').eq('user_id', user.id);
    const { data: groups } = await supabase.from('groups').select('id').eq('user_id', user.id);
    const { data: saved } = await supabase.from('saved_cards').select('id').eq('user_id', user.id);
    setStats({ cards: cards?.length || 0, groups: groups?.length || 0, saved: saved?.length || 0 });
  }

  const name = profile?.full_name || user?.user_metadata?.full_name || 'Vizzi user';
  const email = user?.email || '';
  const bio = profile?.bio || '';
  const jobTitle = profile?.job_title || '';
  const photo = profile?.avatar_url || null;
  const initials = name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', padding: 20, paddingTop: 60 }}>
          <TouchableOpacity
            onPress={() => router.push('/settings' as any)}
            style={{ width: 36, height: 36, borderRadius: 10, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="settings-outline" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={{ alignItems: 'center', paddingHorizontal: 20, paddingBottom: 24 }}>
          {photo ? (
            <Image source={{ uri: photo }} style={{ width: 90, height: 90, borderRadius: 45, marginBottom: 16 }} />
          ) : (
            <View style={{ width: 90, height: 90, borderRadius: 45, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <Text style={{ color: '#fff', fontSize: 30, fontWeight: 'bold' }}>{initials}</Text>
            </View>
          )}
          <Text style={{ color: colors.text, fontSize: 22, fontWeight: 'bold' }}>{name}</Text>
          {jobTitle ? <Text style={{ color: colors.primary, fontSize: 13, marginTop: 4 }}>{jobTitle}</Text> : null}
          <Text style={{ color: colors.textMuted, fontSize: 13, marginTop: 4 }}>{email}</Text>
          {bio ? <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 10, textAlign: 'center', lineHeight: 20 }}>{bio}</Text> : null}
          <TouchableOpacity
            onPress={() => router.push('/edit-profile' as any)}
            style={{ marginTop: 16, paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Edit profile</Text>
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection: 'row', gap: 10, paddingHorizontal: 20, marginBottom: 32 }}>
          {[
            { label: 'Cards', value: stats.cards },
            { label: 'Groups', value: stats.groups },
            { label: 'Saved', value: stats.saved },
          ].map((stat, i) => (
            <View key={i} style={{ flex: 1, backgroundColor: colors.surface, borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: colors.border2 }}>
              <Text style={{ color: colors.text, fontSize: 24, fontWeight: 'bold' }}>{stat.value}</Text>
              <Text style={{ color: colors.textMuted, fontSize: 11, marginTop: 4 }}>{stat.label}</Text>
            </View>
          ))}
        </View>

        <View style={{ paddingHorizontal: 20, gap: 10 }}>
          <Text style={{ color: colors.textMuted, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>Quick actions</Text>

          {[
            { label: 'Create a new card', icon: 'add-circle-outline', color: colors.primary, bg: colors.primary + '22', route: '/create' },
            { label: 'My wallet', icon: 'wallet-outline', color: '#3B82F6', bg: '#3B82F622', route: '/wallet' },
            { label: 'Settings', icon: 'settings-outline', color: colors.textSecondary, bg: colors.surface2, route: '/settings' },
          ].map((item, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => router.push(item.route as any)}
              style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.border2, gap: 14 }}>
              <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: item.bg, alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name={item.icon as any} size={18} color={item.color} />
              </View>
              <Text style={{ color: colors.text, fontSize: 14, flex: 1 }}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.textFaint} />
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>
      <BottomNav active="profile" />
    </View>
  );
}