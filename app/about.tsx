import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from './context/ThemeContext';

export default function About() {
  const router = useRouter();
  const { colors } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: 24, paddingTop: 60, paddingBottom: 40 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 40 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ width: 36, height: 36, borderRadius: 10, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', marginRight: 14 }}>
            <Ionicons name="arrow-back" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
          <Text style={{ color: colors.text, fontSize: 20, fontWeight: 'bold' }}>About Vizzi</Text>
        </View>

        <View style={{ alignItems: 'center', marginBottom: 40 }}>
          <View style={{ width: 80, height: 80, borderRadius: 24, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            <Text style={{ color: '#fff', fontSize: 32, fontWeight: 'bold' }}>V</Text>
          </View>
          <Text style={{ color: colors.text, fontSize: 28, fontWeight: 'bold', letterSpacing: -1 }}>vizzi.</Text>
          <Text style={{ color: colors.textMuted, fontSize: 13, marginTop: 4 }}>Version 1.0.0</Text>
        </View>

        <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: colors.border2, marginBottom: 24 }}>
          <Text style={{ color: colors.textSecondary, fontSize: 14, lineHeight: 24, textAlign: 'center' }}>
            Vizzi is a digital business card app that lets you create, share, and save professional cards in seconds. No paper, no waste — just a QR code or a link.
          </Text>
        </View>

        <View style={{ backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.border2, overflow: 'hidden', marginBottom: 24 }}>
          {[
            { label: 'Version', value: '1.0.0' },
            { label: 'Platform', value: 'iOS & Android' },
            { label: 'Contact', value: 'support@vizzi.app' },
          ].map((item, i, arr) => (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: i < arr.length - 1 ? 1 : 0, borderBottomColor: colors.border2 }}>
              <Text style={{ color: colors.textMuted, fontSize: 13, flex: 1 }}>{item.label}</Text>
              <Text style={{ color: colors.text, fontSize: 13 }}>{item.value}</Text>
            </View>
          ))}
        </View>

        <Text style={{ color: colors.textFaint, fontSize: 12, textAlign: 'center', marginTop: 16 }}>
          Made with care · 2025 Vizzi
        </Text>
      </ScrollView>
    </View>
  );
}