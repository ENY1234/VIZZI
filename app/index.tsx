import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from './context/ThemeContext';
import { supabase } from './supabase';

export default function Index() {
  const router = useRouter();
  const { colors } = useTheme();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function checkSession() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.replace('/home' as any);
      } else {
        setChecking(false);
      }
    }
    checkSession();
  }, []);

  if (checking) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 52, fontWeight: 'bold', color: colors.text, letterSpacing: -2 }}>
          vizzi<Text style={{ color: colors.primary }}>.</Text>
        </Text>
        <ActivityIndicator color={colors.primary} style={{ marginTop: 24 }} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <Text style={{ fontSize: 52, fontWeight: 'bold', color: colors.text, letterSpacing: -2 }}>
        vizzi<Text style={{ color: colors.primary }}>.</Text>
      </Text>
      <Text style={{ fontSize: 14, color: colors.textMuted, marginTop: 8, marginBottom: 60 }}>
        your card, your identity
      </Text>
      <TouchableOpacity
        onPress={() => router.push('/signup')}
        style={{ backgroundColor: colors.primary, padding: 16, borderRadius: 14, width: '100%', alignItems: 'center' }}>
        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Get started</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => router.push('/login')}
        style={{ marginTop: 16 }}>
        <Text style={{ color: colors.textMuted, fontSize: 14 }}>I already have an account</Text>
      </TouchableOpacity>
    </View>
  );
}