import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from './context/ThemeContext';

export default function TermsOfService() {
  const router = useRouter();
  const { colors } = useTheme();

  const sections = [
    { title: 'Acceptance', body: 'By using Vizzi, you agree to these terms. If you do not agree, please do not use the app.' },
    { title: 'Your account', body: 'You are responsible for maintaining the security of your account. You must provide accurate information when creating your account. You may not create accounts for others without permission.' },
    { title: 'Your content', body: 'You own the information you add to your Vizzi cards. By using the app, you grant Vizzi a license to display and share your card when you choose to share it. You are responsible for ensuring your content does not violate any laws.' },
    { title: 'Prohibited use', body: 'You may not use Vizzi to share false or misleading information, spam other users, impersonate others, or engage in any illegal activity. Violations may result in account termination.' },
    { title: 'Service availability', body: 'Vizzi is provided as-is. We do our best to keep the app running but cannot guarantee uninterrupted service. We reserve the right to modify or discontinue the service at any time.' },
    { title: 'Termination', body: 'We reserve the right to suspend or terminate accounts that violate these terms. You may delete your account at any time from the app settings.' },
    { title: 'Contact', body: 'For questions about these terms, contact us at support@vizzi.app' },
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
          <Text style={{ color: colors.text, fontSize: 20, fontWeight: 'bold' }}>Terms of Service</Text>
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