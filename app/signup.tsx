import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity } from 'react-native';
import { useTheme } from './context/ThemeContext';
import { supabase } from './supabase';

export default function Signup() {
  const router = useRouter();
  const { colors } = useTheme();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSignup() {
    if (!fullName || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } }
    });
    if (error) {
      Alert.alert('Error', error.message);
      setLoading(false);
      return;
    }
    if (data.user) {
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: data.user.id,
        full_name: fullName,
        email,
      });
      console.log('Profile creation:', profileError ? profileError.message : 'success');
    }
    setLoading(false);
    router.replace('/home' as any);
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ padding: 24, paddingTop: 80 }}
      keyboardShouldPersistTaps="handled">

      <Text style={{ color: colors.text, fontSize: 28, fontWeight: 'bold', marginBottom: 4 }}>Create account</Text>
      <Text style={{ color: colors.textMuted, fontSize: 14, marginBottom: 40 }}>Join Vizzi today</Text>

      <TextInput
        value={fullName}
        onChangeText={setFullName}
        placeholder="Full name"
        placeholderTextColor={colors.textMuted}
        returnKeyType="done"
        blurOnSubmit={true}
        style={{ backgroundColor: colors.surface, color: colors.text, padding: 14, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: colors.border }}
      />
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
        onPress={handleSignup}
        disabled={loading}
        style={{ backgroundColor: colors.primary, padding: 16, borderRadius: 14, alignItems: 'center', opacity: loading ? 0.6 : 1 }}>
        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>
          {loading ? 'Creating account...' : 'Create account'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.push('/login')}
        style={{ marginTop: 20, alignItems: 'center' }}>
        <Text style={{ color: colors.textMuted, fontSize: 14 }}>
          Already have an account? <Text style={{ color: colors.primary }}>Log in</Text>
        </Text>
      </TouchableOpacity>

    </ScrollView>
  );
}