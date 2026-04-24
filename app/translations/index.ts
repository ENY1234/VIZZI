import * as arMod from './ar';
import * as deMod from './de';
import * as enMod from './en';
import * as esMod from './es';
import * as frMod from './fr';
import { hi, it, ja, ko, ru, tr, zh } from './others';
import * as ptMod from './pt';

const en = enMod.default;
const ar = arMod.default;
const fr = frMod.default;
const es = esMod.default;
const pt = ptMod.default;
const de = deMod.default;

export type TranslationKeys = keyof typeof en;
export type Translations = typeof en;

export const translations: Record<string, Translations> = {
  en, ar, fr, es, pt, de, it, tr, ru, zh, ja, hi, ko,
};

export const LANGUAGES = [
  { code: 'en', label: 'English', nativeLabel: 'English', rtl: false },
  { code: 'ar', label: 'Arabic', nativeLabel: 'العربية', rtl: true },
  { code: 'fr', label: 'French', nativeLabel: 'Français', rtl: false },
  { code: 'es', label: 'Spanish', nativeLabel: 'Español', rtl: false },
  { code: 'pt', label: 'Portuguese', nativeLabel: 'Português', rtl: false },
  { code: 'de', label: 'German', nativeLabel: 'Deutsch', rtl: false },
  { code: 'it', label: 'Italian', nativeLabel: 'Italiano', rtl: false },
  { code: 'tr', label: 'Turkish', nativeLabel: 'Türkçe', rtl: false },
  { code: 'ru', label: 'Russian', nativeLabel: 'Русский', rtl: false },
  { code: 'zh', label: 'Chinese', nativeLabel: '中文', rtl: false },
  { code: 'ja', label: 'Japanese', nativeLabel: '日本語', rtl: false },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी', rtl: false },
  { code: 'ko', label: 'Korean', nativeLabel: '한국어', rtl: false },
];

export default translations;