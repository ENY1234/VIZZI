import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity } from 'react-native';
import { useTheme } from './context/ThemeContext';
import { supabase } from './supabase';

export default function Login() {
  const router = useRouter();
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      Alert.alert('Error', error.message);
      return;
    }
    router.replace('/home' as any);
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: 24, paddingTop: 80 }}>
      <Text style={{ color: colors.text, fontSize: 28, fontWeight: 'bold', marginBottom: 4 }}>Welcome back</Text>
      <Text style={{ color: colors.textMuted, fontSize: 14, marginBottom: 40 }}>Log in to Vizzi</Text>

      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        placeholderTextColor={colors.textMuted}
        keyboardType="email-address"
        autoCapitalize="none"
        returnKeyType="done"
        blurOnSubmit={true}
        style={{ backgroundColor: colors.surface, color: colors.text, padding: 14, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: colors.border }}
      />
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        placeholderTextColor={colors.textMuted}
        secureTextEntry
        returnKeyType="done"
        blurOnSubmit={true}
        style={{ backgroundColor: colors.surface, color: colors.text, padding: 14, borderRadius: 12, marginBottom: 24, borderWidth: 1, borderColor: colors.border }}
      />

      <TouchableOpacity
        onPress={handleLogin}
        disabled={loading}
        style={{ backgroundColor: colors.primary, padding: 16, borderRadius: 14, alignItems: 'center', opacity: loading ? 0.6 : 1 }}>
        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>{loading ? 'Logging in...' : 'Log in'}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/signup')} style={{ marginTop: 20, alignItems: 'center' }}>
        <Text style={{ color: colors.textMuted, fontSize: 14 }}>Don't have an account? <Text style={{ color: colors.primary }}>Sign up</Text></Text>
      </TouchableOpacity>
    </ScrollView>
  );
}