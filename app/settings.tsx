import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from './context/ThemeContext';
import { supabase } from './supabase';

export default function Settings() {
  const router = useRouter();
  const { colors, isDark, toggleTheme, resetToSystem, isManual } = useTheme();
  const [notifications, setNotifications] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleLogout() {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out', style: 'destructive',
        onPress: async () => {
          await supabase.auth.signOut();
          router.replace('/' as any);
        }
      }
    ]);
  }

  async function handleDeleteAccount() {
    Alert.alert(
      'Delete account',
      'This will permanently delete your account, all your cards, groups, and saved contacts. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete permanently', style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Are you absolutely sure?',
              'This action is irreversible. All your data will be gone forever.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Yes, delete everything', style: 'destructive',
                  onPress: async () => {
                    setDeleting(true);
                    try {
                      const { data: { user } } = await supabase.auth.getUser();
                      if (!user) return;

                      // Delete all user data first
                      await supabase.from('saved_cards').delete().eq('user_id', user.id);
                      await supabase.from('groups').delete().eq('user_id', user.id);
                      await supabase.from('cards').delete().eq('user_id', user.id);
                      await supabase.from('profiles').delete().eq('id', user.id);

                      // Get session token
                      const { data: { session } } = await supabase.auth.getSession();

                      // Call edge function to delete auth user
                      const response = await fetch(
                        'https://qpcukamntnlaqzvcfdxp.supabase.co/functions/v1/delete-user',
                        {
                          method: 'POST',
                          headers: {
                            'Authorization': `Bearer ${session?.access_token}`,
                            'Content-Type': 'application/json',
                          },
                        }
                      );

                      const result = await response.json();

                      if (!response.ok) {
                        throw new Error(result.error || 'Failed to delete account');
                      }

                      await supabase.auth.signOut();
                      router.replace('/' as any);
                    } catch (err: any) {
                      setDeleting(false);
                      Alert.alert('Error', err.message || 'Could not delete account. Please try again.');
                    }
                  }
                }
              ]
            );
          }
        }
      ]
    );
  }

  if (deleting) return (
    <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={{ color: colors.textMuted, fontSize: 14 }}>Deleting your account...</Text>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: 24, paddingTop: 60, paddingBottom: 40 }}>

        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 32 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ width: 36, height: 36, borderRadius: 10, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', marginRight: 14 }}>
            <Ionicons name="arrow-back" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
          <Text style={{ color: colors.text, fontSize: 20, fontWeight: 'bold' }}>Settings</Text>
        </View>

        {/* Preferences */}
        <Text style={{ color: colors.textMuted, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 }}>Preferences</Text>
        <View style={{ backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.border2, marginBottom: 24, overflow: 'hidden' }}>

          <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border2 }}>
            <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: colors.surface2, alignItems: 'center', justifyContent: 'center', marginRight: 14 }}>
              <Ionicons name={isDark ? 'moon' : 'sunny'} size={18} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.text, fontSize: 14 }}>{isDark ? 'Dark mode' : 'Light mode'}</Text>
              {isManual ? (
                <TouchableOpacity onPress={resetToSystem}>
                  <Text style={{ color: colors.textMuted, fontSize: 11, marginTop: 2 }}>Tap to use system setting</Text>
                </TouchableOpacity>
              ) : (
                <Text style={{ color: colors.textMuted, fontSize: 11, marginTop: 2 }}>Following system setting</Text>
              )}
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#fff"
            />
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16 }}>
            <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: colors.surface2, alignItems: 'center', justifyContent: 'center', marginRight: 14 }}>
              <Ionicons name="notifications-outline" size={18} color={colors.textSecondary} />
            </View>
            <Text style={{ color: colors.text, fontSize: 14, flex: 1 }}>Notifications</Text>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* Privacy */}
        <Text style={{ color: colors.textMuted, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 }}>Privacy</Text>
        <View style={{ backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.border2, marginBottom: 24, overflow: 'hidden' }}>
          <TouchableOpacity
            onPress={() => router.push('/privacy-policy' as any)}
            style={{ flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border2 }}>
            <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: colors.surface2, alignItems: 'center', justifyContent: 'center', marginRight: 14 }}>
              <Ionicons name="shield-outline" size={18} color={colors.textSecondary} />
            </View>
            <Text style={{ color: colors.text, fontSize: 14, flex: 1 }}>Privacy policy</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.textFaint} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/terms-of-service' as any)}
            style={{ flexDirection: 'row', alignItems: 'center', padding: 16 }}>
            <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: colors.surface2, alignItems: 'center', justifyContent: 'center', marginRight: 14 }}>
              <Ionicons name="document-text-outline" size={18} color={colors.textSecondary} />
            </View>
            <Text style={{ color: colors.text, fontSize: 14, flex: 1 }}>Terms of service</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.textFaint} />
          </TouchableOpacity>
        </View>

        {/* About */}
        <Text style={{ color: colors.textMuted, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 }}>About</Text>
        <View style={{ backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.border2, marginBottom: 24, overflow: 'hidden' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border2 }}>
            <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: colors.surface2, alignItems: 'center', justifyContent: 'center', marginRight: 14 }}>
              <Ionicons name="information-circle-outline" size={18} color={colors.textSecondary} />
            </View>
            <Text style={{ color: colors.text, fontSize: 14, flex: 1 }}>Version</Text>
            <Text style={{ color: colors.textMuted, fontSize: 13 }}>1.0.0</Text>
          </View>

          <TouchableOpacity
            onPress={() => router.push('/about' as any)}
            style={{ flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border2 }}>
            <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: colors.surface2, alignItems: 'center', justifyContent: 'center', marginRight: 14 }}>
              <Ionicons name="apps-outline" size={18} color={colors.textSecondary} />
            </View>
            <Text style={{ color: colors.text, fontSize: 14, flex: 1 }}>About Vizzi</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.textFaint} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => Alert.alert('Coming soon', 'Rate Vizzi will be available when published on the App Store and Google Play.')}
            style={{ flexDirection: 'row', alignItems: 'center', padding: 16 }}>
            <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: colors.surface2, alignItems: 'center', justifyContent: 'center', marginRight: 14 }}>
              <Ionicons name="star-outline" size={18} color={colors.textSecondary} />
            </View>
            <Text style={{ color: colors.text, fontSize: 14, flex: 1 }}>Rate Vizzi</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.textFaint} />
          </TouchableOpacity>
        </View>

        {/* Account */}
        <Text style={{ color: colors.textMuted, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 }}>Account</Text>
        <View style={{ backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.border2, overflow: 'hidden' }}>
          <TouchableOpacity
            onPress={handleLogout}
            style={{ flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border2 }}>
            <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#2a1a1a', alignItems: 'center', justifyContent: 'center', marginRight: 14 }}>
              <Ionicons name="log-out-outline" size={18} color={colors.danger} />
            </View>
            <Text style={{ color: colors.danger, fontSize: 14, flex: 1 }}>Log out</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleDeleteAccount}
            style={{ flexDirection: 'row', alignItems: 'center', padding: 16 }}>
            <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#2a1a1a', alignItems: 'center', justifyContent: 'center', marginRight: 14 }}>
              <Ionicons name="trash-outline" size={18} color={colors.danger} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.danger, fontSize: 14 }}>Delete account</Text>
              <Text style={{ color: colors.textMuted, fontSize: 11, marginTop: 2 }}>Permanently delete all your data</Text>
            </View>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
}