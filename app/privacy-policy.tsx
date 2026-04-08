import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from './context/ThemeContext';

export default function PrivacyPolicy() {
  const router = useRouter();
  const { colors } = useTheme();

  const sections = [
    { title: 'What we collect', body: 'Vizzi collects your name, email address, and the information you add to your digital cards such as phone number, job title, social media links, and profile photo. We only collect what you choose to share.' },
    { title: 'How we use your data', body: 'Your data is used solely to power the Vizzi app — to display your cards, allow others to save them, and personalize your experience. We do not sell, rent, or share your personal data with third parties for marketing purposes.' },
    { title: 'Data storage', body: 'Your data is stored securely using Supabase, a trusted cloud infrastructure provider. All data is encrypted in transit and at rest.' },
    { title: 'Who can see your card', body: 'Your digital card is visible to anyone who has your QR code or shareable link. You control what information appears on your card and can edit or delete it at any time.' },
    { title: 'Your rights', body: 'You can edit, update, or delete your account and all associated data at any time from the app. Once deleted, your data is permanently removed from our servers within 30 days.' },
    { title: 'Contact', body: 'If you have any questions about this privacy policy, contact us at support@vizzi.app' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: 24, paddingTop: 60, paddingBottom: 40 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 32 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ width: 36, height: 36, borderRadius: 10, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', marginRight: 14 }}>
            <Ionicons name="arrow-back" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
          <Text style={{ color: colors.text, fontSize: 20, fontWeight: 'bold' }}>Privacy Policy</Text>
        </View>
        <Text style={{ color: colors.textMuted, fontSize: 11, marginBottom: 24 }}>Last updated: January 2025</Text>
        {sections.map((section, i) => (
          <View key={i} style={{ marginBottom: 24 }}>
            <Text style={{ color: colors.text, fontSize: 15, fontWeight: '700', marginBottom: 8 }}>{section.title}</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 13, lineHeight: 22 }}>{section.body}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}