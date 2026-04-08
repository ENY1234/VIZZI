import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import BottomNav from './components/BottomNav';
import CardPreview from './components/CardPreview';
import SaveToGroupModal from './components/SaveToGroupModal';
import { useTheme } from './context/ThemeContext';
import { supabase } from './supabase';

export default function Scan() {
  const router = useRouter();
  const { colors } = useTheme();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [pasteMode, setPasteMode] = useState(false);
  const [pastedLink, setPastedLink] = useState('');
  const [scannedCard, setScannedCard] = useState<any>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveToGroup, setSaveToGroup] = useState(false);
  const [active, setActive] = useState(true);

  useFocusEffect(
    useCallback(() => {
      setActive(true);
      setScanned(false);
      setScannedCard(null);
      setPasteMode(false);
      setPastedLink('');
      return () => setActive(false);
    }, [])
  );

  async function fetchCardFromLink(link: string) {
    const trimmed = link.trim();
    const match = trimmed.match(/card\/([a-zA-Z0-9\-]+)/);
    if (!match || !match[1]) {
      Alert.alert('Invalid link', 'This does not look like a valid Vizzi card link.', [
        { text: 'OK', onPress: () => { setScanned(false); setPastedLink(''); } }
      ]);
      return;
    }
    const cardId = match[1].trim();
    const { data, error } = await supabase.from('cards').select('*').eq('id', cardId).single();
    if (error || !data) {
      Alert.alert('Card not found', 'Could not find this card.', [
        { text: 'OK', onPress: () => { setScanned(false); setPastedLink(''); } }
      ]);
      return;
    }
    setScannedCard(data);
    setShowSaveModal(true);
  }

  function handleBarCodeScanned({ data }: { data: string }) {
    if (scanned) return;
    setScanned(true);
    fetchCardFromLink(data);
  }

  if (!permission) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <BottomNav active="scan" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <Ionicons name="camera-outline" size={48} color={colors.textFaint} />
          <Text style={{ color: colors.text, fontSize: 18, fontWeight: 'bold', marginTop: 16, textAlign: 'center' }}>Camera access needed</Text>
          <Text style={{ color: colors.textMuted, fontSize: 13, marginTop: 8, textAlign: 'center', marginBottom: 24 }}>To scan QR codes, Vizzi needs access to your camera.</Text>
          <TouchableOpacity
            onPress={requestPermission}
            style={{ backgroundColor: colors.primary, padding: 16, borderRadius: 14, width: '100%', alignItems: 'center' }}>
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 15 }}>Allow camera access</Text>
          </TouchableOpacity>
        </View>
        <BottomNav active="scan" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>

      {!pasteMode ? (
        <View style={{ flex: 1 }}>
          {active && (
            <CameraView
              style={{ flex: 1 }}
              barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
              onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            />
          )}

          <View style={{ position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, paddingTop: 60, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>Scan a card</Text>
              <TouchableOpacity
                onPress={() => setPasteMode(true)}
                style={{ backgroundColor: 'rgba(0,0,0,0.5)', padding: 10, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name="link-outline" size={16} color="#fff" />
                <Text style={{ color: '#fff', fontSize: 12 }}>Paste link</Text>
              </TouchableOpacity>
            </View>

            <View style={{ width: 220, height: 220, position: 'relative' }}>
              <View style={{ position: 'absolute', top: 0, left: 0, width: 40, height: 40, borderTopWidth: 3, borderLeftWidth: 3, borderColor: colors.primary, borderRadius: 4 }} />
              <View style={{ position: 'absolute', top: 0, right: 0, width: 40, height: 40, borderTopWidth: 3, borderRightWidth: 3, borderColor: colors.primary, borderRadius: 4 }} />
              <View style={{ position: 'absolute', bottom: 0, left: 0, width: 40, height: 40, borderBottomWidth: 3, borderLeftWidth: 3, borderColor: colors.primary, borderRadius: 4 }} />
              <View style={{ position: 'absolute', bottom: 0, right: 0, width: 40, height: 40, borderBottomWidth: 3, borderRightWidth: 3, borderColor: colors.primary, borderRadius: 4 }} />
            </View>

            <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginTop: 24, textAlign: 'center' }}>
              Point your camera at a Vizzi QR code
            </Text>

            {scanned && (
              <TouchableOpacity
                onPress={() => setScanned(false)}
                style={{ marginTop: 16, backgroundColor: 'rgba(0,0,0,0.6)', padding: 12, borderRadius: 12 }}>
                <Text style={{ color: '#fff', fontSize: 13 }}>Tap to scan again</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      ) : (
        <View style={{ flex: 1, padding: 24, paddingTop: 80 }}>
          <TouchableOpacity
            onPress={() => { setPasteMode(false); setPastedLink(''); }}
            style={{ width: 36, height: 36, borderRadius: 10, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
            <Ionicons name="arrow-back" size={18} color={colors.textSecondary} />
          </TouchableOpacity>

          <Text style={{ color: colors.text, fontSize: 24, fontWeight: 'bold', marginBottom: 4 }}>Paste a link</Text>
          <Text style={{ color: colors.textMuted, fontSize: 13, marginBottom: 32 }}>Paste a Vizzi card link to view and save it</Text>

          <TextInput
            value={pastedLink}
            onChangeText={setPastedLink}
            placeholder="https://vizzi.app/card/..."
            placeholderTextColor={colors.textMuted}
            style={{ backgroundColor: colors.surface, color: colors.text, padding: 14, borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: colors.border, fontSize: 13 }}
            autoCapitalize="none"
            returnKeyType="done"
            blurOnSubmit={true}
          />

          <TouchableOpacity
            onPress={() => fetchCardFromLink(pastedLink)}
            disabled={!pastedLink.trim()}
            style={{ backgroundColor: pastedLink.trim() ? colors.primary : colors.surface2, padding: 16, borderRadius: 14, alignItems: 'center' }}>
            <Text style={{ color: pastedLink.trim() ? '#fff' : colors.textMuted, fontWeight: 'bold', fontSize: 15 }}>Find card</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Card preview modal */}
      <Modal visible={showSaveModal} transparent animationType="slide">
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View style={{ backgroundColor: colors.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 40, maxHeight: '90%', borderTopWidth: 1, borderColor: colors.border2 }}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {scannedCard && (
                <View style={{ marginBottom: 20 }}>
                  <CardPreview
                    layout={scannedCard.layout || 'classic'}
                    color={scannedCard.theme || '#FF5C87'}
                    name={scannedCard.name}
                    role={scannedCard.job_title}
                    phone={scannedCard.phone}
                    email={scannedCard.email}
                    address={scannedCard.address}
                    instagram={scannedCard.instagram}
                    linkedin={scannedCard.linkedin}
                    whatsapp={scannedCard.whatsapp}
                    website={scannedCard.website}
                    tiktok={scannedCard.tiktok}
                    businessType={scannedCard.business_type || 'other'}
                  />
                </View>
              )}
              <TouchableOpacity
                onPress={() => { setShowSaveModal(false); setSaveToGroup(true); }}
                style={{ backgroundColor: colors.primary, padding: 16, borderRadius: 14, alignItems: 'center', marginBottom: 10 }}>
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 15 }}>Save to group</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => { setShowSaveModal(false); setScanned(false); setScannedCard(null); }}
                style={{ padding: 14, borderRadius: 14, alignItems: 'center' }}>
                <Text style={{ color: colors.textMuted, fontSize: 14 }}>Cancel</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {scannedCard && (
        <SaveToGroupModal
          visible={saveToGroup}
          cardId={scannedCard.id}
          cardName={scannedCard.name}
          onClose={() => setSaveToGroup(false)}
          onSaved={(groupId) => {
            setSaveToGroup(false);
            setScannedCard(null);
            setScanned(false);
            setPasteMode(false);
            setPastedLink('');
            router.push({ pathname: '/group-detail', params: { groupId } } as any);
          }}
        />
      )}

      <BottomNav active="scan" />
    </View>
  );
}