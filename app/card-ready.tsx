import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Modal, ScrollView, Share, Switch, Text, TouchableOpacity, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import CardPreview from './components/CardPreview';
import SaveToGroupModal from './components/SaveToGroupModal';
import { useTheme } from './context/ThemeContext';
import { supabase } from './supabase';

export default function CardReady() {
  const router = useRouter();
  const { colors } = useTheme();
  const { cardId, from, groupId } = useLocalSearchParams();
  const [card, setCard] = useState<any>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [qrExpanded, setQrExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showSaveToGroup, setShowSaveToGroup] = useState(false);
  const [isPublic, setIsPublic] = useState(true);

  const cardLink = `https://vizzi.app/card/${cardId}`;

  useEffect(() => {
    async function getCard() {
      if (!cardId) return;
      const { data } = await supabase.from('cards').select('*').eq('id', cardId).single();
      if (data) {
        setCard(data);
        setIsPublic(data.is_public ?? true);
        const { data: { user } } = await supabase.auth.getUser();
        if (user) setIsOwner(data.user_id === user.id);
      }
    }
    getCard();
  }, [cardId]);

  async function handleShare() {
    await Share.share({ message: `Check out my Vizzi card! ${cardLink}`, url: cardLink });
  }

  async function handleCopyLink() {
    await Clipboard.setStringAsync(cardLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleDelete() {
    Alert.alert('Delete card', 'Are you sure? This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          await supabase.from('cards').delete().eq('id', cardId);
          router.replace('/home' as any);
        }
      }
    ]);
  }

  async function handleTogglePublic(val: boolean) {
    setIsPublic(val);
    await supabase.from('cards').update({ is_public: val }).eq('id', cardId);
    setCard({ ...card, is_public: val });
  }

  function handleDone() {
    if (from === 'group' && groupId) {
      router.push({ pathname: '/group-detail', params: { groupId } } as any);
    } else if (from === 'wallet') {
      router.push('/wallet' as any);
    } else {
      router.push('/home' as any);
    }
  }

  if (!card) return (
    <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: colors.textMuted }}>Loading...</Text>
    </View>
  );

  // ── VIEWER MODE (not the owner) ──
  if (!isOwner) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <ScrollView contentContainerStyle={{ padding: 24, paddingTop: 60, paddingBottom: 40 }}>

          <TouchableOpacity
            onPress={() => router.back()}
            style={{ width: 36, height: 36, borderRadius: 10, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
            <Ionicons name="arrow-back" size={18} color={colors.textSecondary} />
          </TouchableOpacity>

          <CardPreview
            layout={card.layout || 'classic'}
            color={card.theme || '#FF5C87'}
            name={card.name}
            role={card.job_title}
            phone={card.phone}
            email={card.email}
            address={card.address}
            instagram={card.instagram}
            linkedin={card.linkedin}
            whatsapp={card.whatsapp}
            website={card.website}
            tiktok={card.tiktok}
            businessType={card.business_type || 'other'}
          />

          {/* QR only shown if public */}
          {card.is_public && (
            <TouchableOpacity
              onPress={() => setQrExpanded(true)}
              style={{ alignItems: 'center', marginTop: 24, marginBottom: 24 }}>
              <View style={{ backgroundColor: '#fff', padding: 16, borderRadius: 20 }}>
                <QRCode value={cardLink} size={120} color="#111" backgroundColor="#fff" />
              </View>
              <Text style={{ color: colors.textMuted, fontSize: 11, marginTop: 8 }}>Tap to expand</Text>
            </TouchableOpacity>
          )}

          {/* Share and copy only if public */}
          {card.is_public ? (
            <>
              <TouchableOpacity
                onPress={handleShare}
                style={{ backgroundColor: colors.primary, padding: 16, borderRadius: 14, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 10 }}>
                <Ionicons name="share-outline" size={18} color="#fff" />
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 15 }}>Share</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleCopyLink}
                style={{ backgroundColor: colors.surface, padding: 16, borderRadius: 14, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 10, borderWidth: 1, borderColor: colors.border }}>
                <Ionicons name={copied ? 'checkmark-outline' : 'link-outline'} size={18} color={copied ? colors.success : colors.textSecondary} />
                <Text style={{ color: copied ? colors.success : colors.textSecondary, fontWeight: '500', fontSize: 15 }}>
                  {copied ? 'Link copied!' : 'Copy link'}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 14, marginBottom: 10, backgroundColor: colors.surface, borderRadius: 14, borderWidth: 1, borderColor: colors.border }}>
              <Ionicons name="lock-closed-outline" size={16} color={colors.textMuted} />
              <Text style={{ color: colors.textMuted, fontSize: 13 }}>This card is private and cannot be reshared</Text>
            </View>
          )}

          <TouchableOpacity
            onPress={() => setShowSaveToGroup(true)}
            style={{ backgroundColor: colors.surface, padding: 16, borderRadius: 14, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 16, borderWidth: 1, borderColor: colors.border }}>
            <Ionicons name="people-outline" size={18} color={colors.textSecondary} />
            <Text style={{ color: colors.textSecondary, fontWeight: '500', fontSize: 15 }}>Save to group</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.back()}
            style={{ backgroundColor: colors.surface, padding: 16, borderRadius: 14, alignItems: 'center', borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ color: colors.text, fontWeight: 'bold', fontSize: 15 }}>Done</Text>
          </TouchableOpacity>

        </ScrollView>

        <Modal visible={qrExpanded} transparent animationType="fade">
          <TouchableOpacity
            onPress={() => setQrExpanded(false)}
            style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ backgroundColor: '#fff', padding: 32, borderRadius: 28 }}>
              <QRCode value={cardLink} size={240} color="#111" backgroundColor="#fff" />
            </View>
            <Text style={{ color: '#555', fontSize: 13, marginTop: 20 }}>Tap anywhere to close</Text>
          </TouchableOpacity>
        </Modal>

        <SaveToGroupModal
          visible={showSaveToGroup}
          cardId={card?.id}
          cardName={card?.name}
          onClose={() => setShowSaveToGroup(false)}
          onSaved={(groupId) => {
            setShowSaveToGroup(false);
            router.push({ pathname: '/group-detail', params: { groupId } } as any);
          }}
        />
      </View>
    );
  }

  // ── OWNER MODE ──
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: 24, paddingTop: 60, paddingBottom: 40 }}>

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
          <Text style={{ color: colors.text, fontSize: 16, fontWeight: 'bold' }}>Your card is ready</Text>
        </View>

        <CardPreview
          layout={card.layout || 'classic'}
          color={card.theme || '#FF5C87'}
          name={card.name}
          role={card.job_title}
          phone={card.phone}
          email={card.email}
          address={card.address}
          instagram={card.instagram}
          linkedin={card.linkedin}
          whatsapp={card.whatsapp}
          website={card.website}
          tiktok={card.tiktok}
          businessType={card.business_type || 'other'}
        />

        <TouchableOpacity
          onPress={() => setQrExpanded(true)}
          style={{ alignItems: 'center', marginTop: 24, marginBottom: 24 }}>
          <View style={{ backgroundColor: '#fff', padding: 16, borderRadius: 20 }}>
            <QRCode value={cardLink} size={120} color="#111" backgroundColor="#fff" />
          </View>
          <Text style={{ color: colors.textMuted, fontSize: 11, marginTop: 8 }}>Tap to expand</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleShare}
          style={{ backgroundColor: colors.primary, padding: 16, borderRadius: 14, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 10 }}>
          <Ionicons name="share-outline" size={18} color="#fff" />
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 15 }}>Share</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleCopyLink}
          style={{ backgroundColor: colors.surface, padding: 16, borderRadius: 14, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 10, borderWidth: 1, borderColor: colors.border }}>
          <Ionicons name={copied ? 'checkmark-outline' : 'link-outline'} size={18} color={copied ? colors.success : colors.textSecondary} />
          <Text style={{ color: copied ? colors.success : colors.textSecondary, fontWeight: '500', fontSize: 15 }}>
            {copied ? 'Link copied!' : 'Copy link'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setShowSaveToGroup(true)}
          style={{ backgroundColor: colors.surface, padding: 16, borderRadius: 14, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 16, borderWidth: 1, borderColor: colors.border }}>
          <Ionicons name="people-outline" size={18} color={colors.textSecondary} />
          <Text style={{ color: colors.textSecondary, fontWeight: '500', fontSize: 15 }}>Save to group</Text>
        </TouchableOpacity>

        {/* Public/Private toggle */}
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 14, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: colors.border }}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.text, fontSize: 14, fontWeight: '600' }}>
              {isPublic ? 'Public card' : 'Private card'}
            </Text>
            <Text style={{ color: colors.textMuted, fontSize: 11, marginTop: 2 }}>
              {isPublic ? 'Everyone can discover this card' : 'Only you can share this card'}
            </Text>
          </View>
          <Switch
            value={isPublic}
            onValueChange={handleTogglePublic}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor="#fff"
          />
        </View>

        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
          <TouchableOpacity
            onPress={() => router.push(`/edit-card?cardId=${cardId}` as any)}
            style={{ flex: 1, backgroundColor: colors.surface, padding: 14, borderRadius: 14, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8, borderWidth: 1, borderColor: colors.border }}>
            <Ionicons name="create-outline" size={18} color={colors.textSecondary} />
            <Text style={{ color: colors.textSecondary, fontWeight: '500', fontSize: 14 }}>Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleDelete}
            style={{ flex: 1, backgroundColor: colors.surface, padding: 14, borderRadius: 14, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8, borderWidth: 1, borderColor: colors.border }}>
            <Ionicons name="trash-outline" size={18} color={colors.danger} />
            <Text style={{ color: colors.danger, fontWeight: '500', fontSize: 14 }}>Delete</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={handleDone}
          style={{ backgroundColor: colors.surface, padding: 16, borderRadius: 14, alignItems: 'center', borderWidth: 1, borderColor: colors.border }}>
          <Text style={{ color: colors.text, fontWeight: 'bold', fontSize: 15 }}>Done</Text>
        </TouchableOpacity>

      </ScrollView>

      <Modal visible={qrExpanded} transparent animationType="fade">
        <TouchableOpacity
          onPress={() => setQrExpanded(false)}
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ backgroundColor: '#fff', padding: 32, borderRadius: 28 }}>
            <QRCode value={cardLink} size={240} color="#111" backgroundColor="#fff" />
          </View>
          <Text style={{ color: '#555', fontSize: 13, marginTop: 20 }}>Tap anywhere to close</Text>
        </TouchableOpacity>
      </Modal>

      <SaveToGroupModal
        visible={showSaveToGroup}
        cardId={card?.id}
        cardName={card?.name}
        onClose={() => setShowSaveToGroup(false)}
        onSaved={(groupId) => {
          setShowSaveToGroup(false);
          router.push({ pathname: '/group-detail', params: { groupId } } as any);
        }}
      />
    </View>
  );
}