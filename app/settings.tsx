import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Modal, ScrollView, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useLanguage } from './context/LanguageContext';
import { useTheme } from './context/ThemeContext';
import { supabase } from './supabase';
import { LANGUAGES } from './translations';

export default function Settings() {
  const router = useRouter();
  const { colors, isDark, toggleTheme, resetToSystem, isManual } = useTheme();
  const { t, language, setLanguage } = useLanguage();
  const [notifications, setNotifications] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showLanguagePicker, setShowLanguagePicker] = useState(false);

  async function handleLogout() {
    Alert.alert(t.logOutConfirmTitle, t.logOutConfirmMsg, [
      { text: t.cancel, style: 'cancel' },
      {
        text: t.logOut, style: 'destructive',
        onPress: async () => {
          await supabase.auth.signOut();
          router.replace('/' as any);
        }
      }
    ]);
  }

  async function handleDeleteAccount() {
    Alert.alert(t.deleteAccount, t.deleteAccountMsg, [
      { text: t.cancel, style: 'cancel' },
      {
        text: t.deletePermanently, style: 'destructive',
        onPress: () => {
          Alert.alert(t.deleteAccountConfirmTitle, t.deleteAccountConfirmMsg, [
            { text: t.cancel, style: 'cancel' },
            {
              text: t.deleteEverything, style: 'destructive',
              onPress: async () => {
                setDeleting(true);
                try {
                  const { data: { user } } = await supabase.auth.getUser();
                  if (!user) return;
                  await supabase.from('saved_cards').delete().eq('user_id', user.id);
                  await supabase.from('groups').delete().eq('user_id', user.id);
                  await supabase.from('cards').delete().eq('user_id', user.id);
                  await supabase.from('profiles').delete().eq('id', user.id);
                  const { error } = await supabase.functions.invoke('delete-user');
                  if (error) throw new Error(error.message || 'Failed to delete account');
                  await supabase.auth.signOut();
                  router.replace('/' as any);
                } catch (err: any) {
                  setDeleting(false);
                  Alert.alert(t.errorTitle, err.message || t.couldNotDelete);
                }
              }
            }
          ]);
        }
      }
    ]);
  }

  const currentLang = LANGUAGES.find((l: { code: string; nativeLabel: string }) => l.code === language);

  if (deleting) return (
    <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={{ color: colors.textMuted, fontSize: 14 }}>{t.deletingAccount}</Text>
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
          <Text style={{ color: colors.text, fontSize: 20, fontWeight: 'bold' }}>{t.settings}</Text>
        </View>

        {/* Preferences */}
        <Text style={{ color: colors.textMuted, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 }}>{t.preferences}</Text>
        <View style={{ backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.border2, marginBottom: 24, overflow: 'hidden' }}>

          {/* Dark mode */}
          <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border2 }}>
            <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: colors.surface2, alignItems: 'center', justifyContent: 'center', marginRight: 14 }}>
              <Ionicons name={isDark ? 'moon' : 'sunny'} size={18} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.text, fontSize: 14 }}>{isDark ? t.darkMode : t.lightMode}</Text>
              {isManual ? (
                <TouchableOpacity onPress={resetToSystem}>
                  <Text style={{ color: colors.textMuted, fontSize: 11, marginTop: 2 }}>{t.tapToUseSystem}</Text>
                </TouchableOpacity>
              ) : (
                <Text style={{ color: colors.textMuted, fontSize: 11, marginTop: 2 }}>{t.followingSystem}</Text>
              )}
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#fff"
            />
          </View>

          {/* Notifications */}
          <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border2 }}>
            <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: colors.surface2, alignItems: 'center', justifyContent: 'center', marginRight: 14 }}>
              <Ionicons name="notifications-outline" size={18} color={colors.textSecondary} />
            </View>
            <Text style={{ color: colors.text, fontSize: 14, flex: 1 }}>{t.notifications}</Text>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#fff"
            />
          </View>

          {/* Language */}
          <TouchableOpacity
            onPress={() => setShowLanguagePicker(true)}
            style={{ flexDirection: 'row', alignItems: 'center', padding: 16 }}>
            <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: colors.surface2, alignItems: 'center', justifyContent: 'center', marginRight: 14 }}>
              <Ionicons name="language-outline" size={18} color={colors.textSecondary} />
            </View>
            <Text style={{ color: colors.text, fontSize: 14, flex: 1 }}>{t.language}</Text>
            <Text style={{ color: colors.textMuted, fontSize: 13, marginRight: 6 }}>{currentLang?.nativeLabel}</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.textFaint} />
          </TouchableOpacity>
        </View>

        {/* Privacy */}
        <Text style={{ color: colors.textMuted, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 }}>{t.privacy}</Text>
        <View style={{ backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.border2, marginBottom: 24, overflow: 'hidden' }}>
          <TouchableOpacity
            onPress={() => router.push('/privacy-policy' as any)}
            style={{ flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border2 }}>
            <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: colors.surface2, alignItems: 'center', justifyContent: 'center', marginRight: 14 }}>
              <Ionicons name="shield-outline" size={18} color={colors.textSecondary} />
            </View>
            <Text style={{ color: colors.text, fontSize: 14, flex: 1 }}>{t.privacyPolicy}</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.textFaint} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/terms-of-service' as any)}
            style={{ flexDirection: 'row', alignItems: 'center', padding: 16 }}>
            <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: colors.surface2, alignItems: 'center', justifyContent: 'center', marginRight: 14 }}>
              <Ionicons name="document-text-outline" size={18} color={colors.textSecondary} />
            </View>
            <Text style={{ color: colors.text, fontSize: 14, flex: 1 }}>{t.termsOfService}</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.textFaint} />
          </TouchableOpacity>
        </View>

        {/* About */}
        <Text style={{ color: colors.textMuted, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 }}>{t.about}</Text>
        <View style={{ backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.border2, marginBottom: 24, overflow: 'hidden' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border2 }}>
            <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: colors.surface2, alignItems: 'center', justifyContent: 'center', marginRight: 14 }}>
              <Ionicons name="information-circle-outline" size={18} color={colors.textSecondary} />
            </View>
            <Text style={{ color: colors.text, fontSize: 14, flex: 1 }}>{t.version}</Text>
            <Text style={{ color: colors.textMuted, fontSize: 13 }}>1.0.0</Text>
          </View>

          <TouchableOpacity
            onPress={() => router.push('/about' as any)}
            style={{ flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border2 }}>
            <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: colors.surface2, alignItems: 'center', justifyContent: 'center', marginRight: 14 }}>
              <Ionicons name="apps-outline" size={18} color={colors.textSecondary} />
            </View>
            <Text style={{ color: colors.text, fontSize: 14, flex: 1 }}>{t.aboutVizzi}</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.textFaint} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => Alert.alert(t.rateComingSoon, t.rateComingSoonMsg)}
            style={{ flexDirection: 'row', alignItems: 'center', padding: 16 }}>
            <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: colors.surface2, alignItems: 'center', justifyContent: 'center', marginRight: 14 }}>
              <Ionicons name="star-outline" size={18} color={colors.textSecondary} />
            </View>
            <Text style={{ color: colors.text, fontSize: 14, flex: 1 }}>{t.rateVizzi}</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.textFaint} />
          </TouchableOpacity>
        </View>

        {/* Account */}
        <Text style={{ color: colors.textMuted, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 }}>{t.account}</Text>
        <View style={{ backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.border2, overflow: 'hidden' }}>
          <TouchableOpacity
            onPress={handleLogout}
            style={{ flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border2 }}>
            <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#2a1a1a', alignItems: 'center', justifyContent: 'center', marginRight: 14 }}>
              <Ionicons name="log-out-outline" size={18} color={colors.danger} />
            </View>
            <Text style={{ color: colors.danger, fontSize: 14, flex: 1 }}>{t.logOut}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleDeleteAccount}
            style={{ flexDirection: 'row', alignItems: 'center', padding: 16 }}>
            <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#2a1a1a', alignItems: 'center', justifyContent: 'center', marginRight: 14 }}>
              <Ionicons name="trash-outline" size={18} color={colors.danger} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.danger, fontSize: 14 }}>{t.deleteAccount}</Text>
              <Text style={{ color: colors.textMuted, fontSize: 11, marginTop: 2 }}>{t.deleteAccountSub}</Text>
            </View>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* Language Picker Modal */}
      <Modal visible={showLanguagePicker} transparent animationType="slide">
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View style={{ backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: 40 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: colors.border2 }}>
              <Text style={{ color: colors.text, fontSize: 16, fontWeight: 'bold' }}>{t.selectLanguage}</Text>
              <TouchableOpacity onPress={() => setShowLanguagePicker(false)}>
                <Ionicons name="close" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 420 }}>
              {LANGUAGES.map((lang: { code: string; label: string; nativeLabel: string; rtl: boolean }) => {
                const isSelected = language === lang.code;
                return (
                  <TouchableOpacity
                    key={lang.code}
                    onPress={() => { setLanguage(lang.code); setShowLanguagePicker(false); }}
                    style={{ flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border2 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: colors.text, fontSize: 14, fontWeight: isSelected ? '600' : '400' }}>{lang.nativeLabel}</Text>
                      <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 2 }}>{lang.label}</Text>
                    </View>
                    {isSelected && <Ionicons name="checkmark" size={18} color={colors.primary} />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}