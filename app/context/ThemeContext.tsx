import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';

type ThemeType = 'dark' | 'light';

type ThemeContextType = {
  theme: ThemeType;
  isDark: boolean;
  toggleTheme: () => void;
  resetToSystem: () => void;
  isManual: boolean;
  colors: typeof darkColors;
};

export const darkColors = {
  background: '#0d0d0d',
  surface: '#1a1a1a',
  surface2: '#111',
  border: '#2a2a2a',
  border2: '#222',
  text: '#ffffff',
  textSecondary: '#888888',
  textMuted: '#555555',
  textFaint: '#444444',
  primary: '#FF5C87',
  danger: '#E24B4A',
  success: '#10B981',
  cardBg: '#1a1a1a',
};

export const lightColors = {
  background: '#f5f5f5',
  surface: '#ffffff',
  surface2: '#f0f0f0',
  border: '#e0e0e0',
  border2: '#e8e8e8',
  text: '#111111',
  textSecondary: '#555555',
  textMuted: '#888888',
  textFaint: '#aaaaaa',
  primary: '#FF5C87',
  danger: '#E24B4A',
  success: '#10B981',
  cardBg: '#ffffff',
};

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  isDark: true,
  toggleTheme: () => {},
  resetToSystem: () => {},
  isManual: false,
  colors: darkColors,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [manualTheme, setManualTheme] = useState<ThemeType | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function loadTheme() {
      const saved = await AsyncStorage.getItem('vizzi_theme');
      if (saved === 'dark' || saved === 'light') {
        setManualTheme(saved);
      }
      setLoaded(true);
    }
    loadTheme();
  }, []);

  const theme: ThemeType = manualTheme || (systemScheme === 'light' ? 'light' : 'dark');
  const isDark = theme === 'dark';
  const colors = isDark ? darkColors : lightColors;

  async function toggleTheme() {
    const next: ThemeType = isDark ? 'light' : 'dark';
    setManualTheme(next);
    await AsyncStorage.setItem('vizzi_theme', next);
  }

  async function resetToSystem() {
    setManualTheme(null);
    await AsyncStorage.removeItem('vizzi_theme');
  }

  if (!loaded) return null;

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme, resetToSystem, isManual: manualTheme !== null, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}