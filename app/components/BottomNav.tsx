import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

type Props = {
  active: 'home' | 'wallet' | 'scan' | 'profile';
};

export default function BottomNav({ active }: Props) {
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useLanguage();

  const tabs = [
    { key: 'home', label: t.home, icon: 'home-outline', activeIcon: 'home', route: '/home' },
    { key: 'wallet', label: t.wallet, icon: 'wallet-outline', activeIcon: 'wallet', route: '/wallet' },
    { key: 'create', label: '', icon: 'add', activeIcon: 'add', route: '/create' },
    { key: 'scan', label: t.scan, icon: 'qr-code-outline', activeIcon: 'qr-code', route: '/scan' },
    { key: 'profile', label: t.profile, icon: 'person-outline', activeIcon: 'person', route: '/profile' },
  ];

  return (
    <View style={{ flexDirection: 'row', backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border2, paddingBottom: 24, paddingTop: 10 }}>
      {tabs.map((tab) => {
        const isActive = active === tab.key;
        const isCreate = tab.key === 'create';
        return (
          <TouchableOpacity
            key={tab.key}
            onPress={() => router.push(tab.route as any)}
            style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            {isCreate ? (
              <View style={{ width: 48, height: 48, borderRadius: 16, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 2 }}>
                <Ionicons name="add" size={26} color="#fff" />
              </View>
            ) : (
              <>
                <Ionicons
                  name={(isActive ? tab.activeIcon : tab.icon) as any}
                  size={22}
                  color={isActive ? colors.primary : colors.textMuted}
                />
                <Text style={{ color: isActive ? colors.primary : colors.textMuted, fontSize: 10, marginTop: 3 }}>{tab.label}</Text>
              </>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}