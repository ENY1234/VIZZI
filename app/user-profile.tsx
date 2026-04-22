import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as Linking from 'expo-linking';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, Modal, ScrollView, Share, Text, TouchableOpacity, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import CardPreview from './components/CardPreview';
import SaveToGroupModal from './components/SaveToGroupModal';
import { useTheme } from './context/ThemeContext';
import { supabase } from './supabase';

export default function UserProfile() {
  const router = useRouter();
  const { colors } = useTheme();
  const { userId } = useLocalSearchParams();
  const [profile, setProfile] = useState<any>(null);
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCard, setSelectedCard] = useState<any>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [expandedQr, setExpandedQr] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    loadUserProfile();
  }, [userId]);

  async function loadUserProfile() {
    const { data: prof } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (prof) setProfile(prof);

    const { data: userCards } = await supabase
      .from('cards')
      .select('*')
      .eq('user_id', userId)
      .eq('is_public', true)
      .order('order', { ascending: true });
    if (userCards) setCards(userCards);

    setLoading(false);
  }

  async function handleCopyLink(cardId: string) {
    const link = `https://dancing-bavarois-5ae1b1.netlify.app/card/${cardId}`;
    await Clipboard.setStringAsync(link);
    setCopied(cardId);
    setTimeout(() => setCopied(null), 2000);
  }

  async function handleShare(cardId: string, cardName: string) {
    const link = `https://dancing-bavarois-5ae1b1.netlify.app/card/${cardId}`;
    await Share.share({ message: `Check out ${cardName}'s Vizzi card! ${link}`, url: link });
  }

  function handleContact(type: string, value: string) {
    if (!value) return;
    switch (type) {
      case 'phone': Linking.openURL(`tel:${value}`); break;
      case 'email': Linking.openURL(`mailto:${value}`); break;
      case 'whatsapp': Linking.openURL(`https://wa.me/${value}`); break;
      case 'instagram': Linking.openURL(`https://instagram.com/${value}`); break;
      case 'linkedin': Linking.openURL(value.startsWith('http') ? value : `https://linkedin.com/in/${value}`); break;
      case 'tiktok': Linking.openURL(`https://tiktok.com/@${value}`); break;
      case 'website': Linking.openURL(value.startsWith('http') ? value : `https://${value}`); break;
    }
  }

  const name = profile?.full_name || 'Vizzi user';
  const initials = name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  const photo = profile?.avatar_url || null;

  if (loading) return (
    <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: colors.textMuted }}>Loading...</Text>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ paddingTop: 60, paddingBottom: 40 }}>

        {/* Back button */}
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ width: 36, height: 36, borderRadius: 10, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', marginBottom: 28, marginHorizontal: 24 }}>
          <Ionicons name="arrow-back" size={18} color={colors.textSecondary} />
        </TouchableOpacity>

        {/* Profile header */}
        <View style={{ alignItems: 'center', paddingHorizontal: 24, marginBottom: 24 }}>
          {photo ? (
            <Image source={{ uri: photo }} style={{ width: 90, height: 90, borderRadius: 45, marginBottom: 16 }} />
          ) : (
            <View style={{ width: 90, height: 90, borderRadius: 45, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <Text style={{ color: '#fff', fontSize: 30, fontWeight: 'bold' }}>{initials}</Text>
            </View>
          )}
          <Text style={{ color: colors.text, fontSize: 24, fontWeight: 'bold', textAlign: 'center' }}>{name}</Text>
          {profile?.job_title ? (
            <Text style={{ color: colors.primary, fontSize: 13, marginTop: 4 }}>{profile.job_title}</Text>
          ) : null}
          {profile?.bio ? (
            <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 10, textAlign: 'center', lineHeight: 20, paddingHorizontal: 20 }}>{profile.bio}</Text>
          ) : null}
        </View>

        {/* Contact info from profile */}
        {(profile?.email) && (
          <View style={{ marginHorizontal: 24, marginBottom: 24, backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.border2, overflow: 'hidden' }}>
            <Text style={{ color: colors.textMuted, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', padding: 16, paddingBottom: 8 }}>Contact</Text>
            {profile?.email && (
              <TouchableOpacity
                onPress={() => handleContact('email', profile.email)}
                style={{ flexDirection: 'row', alignItems: 'center', padding: 14, paddingTop: 8, gap: 12 }}>
                <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: colors.surface2, alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name="mail-outline" size={16} color={colors.primary} />
                </View>
                <Text style={{ color: colors.text, fontSize: 13 }}>{profile.email}</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Stats */}
        <View style={{ flexDirection: 'row', marginHorizontal: 24, marginBottom: 28, gap: 10 }}>
          <View style={{ flex: 1, backgroundColor: colors.surface, borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: colors.border2 }}>
            <Text style={{ color: colors.text, fontSize: 22, fontWeight: 'bold' }}>{cards.length}</Text>
            <Text style={{ color: colors.textMuted, fontSize: 11, marginTop: 4 }}>Public cards</Text>
          </View>
        </View>

        {/* Cards */}
        <Text style={{ color: colors.textMuted, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', paddingHorizontal: 24, marginBottom: 16 }}>
          Cards
        </Text>

        {cards.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: 40 }}>
            <Ionicons name="card-outline" size={40} color={colors.textFaint} />
            <Text style={{ color: colors.textMuted, fontSize: 13, marginTop: 12 }}>No public cards yet</Text>
          </View>
        ) : (
          cards.map((card) => {
            const cardLink = `https://dancing-bavarois-5ae1b1.netlify.app/card/${card.id}`;
            return (
              <View key={card.id} style={{ marginBottom: 24, paddingHorizontal: 24 }}>
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

                {/* Contact actions */}
                <View style={{ backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.border2, marginTop: 10, overflow: 'hidden' }}>
                  {card.phone && (
                    <TouchableOpacity
                      onPress={() => handleContact('phone', card.phone)}
                      style={{ flexDirection: 'row', alignItems: 'center', padding: 14, borderBottomWidth: 1, borderBottomColor: colors.border2, gap: 12 }}>
                      <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: '#10B98122', alignItems: 'center', justifyContent: 'center' }}>
                        <Ionicons name="call-outline" size={16} color="#10B981" />
                      </View>
                      <Text style={{ color: colors.text, fontSize: 13, flex: 1 }}>{card.phone}</Text>
                      <Ionicons name="chevron-forward" size={14} color={colors.textFaint} />
                    </TouchableOpacity>
                  )}
                  {card.email && (
                    <TouchableOpacity
                      onPress={() => handleContact('email', card.email)}
                      style={{ flexDirection: 'row', alignItems: 'center', padding: 14, borderBottomWidth: card.whatsapp || card.instagram || card.linkedin || card.tiktok || card.website ? 1 : 0, borderBottomColor: colors.border2, gap: 12 }}>
                      <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: '#3B82F622', alignItems: 'center', justifyContent: 'center' }}>
                        <Ionicons name="mail-outline" size={16} color="#3B82F6" />
                      </View>
                      <Text style={{ color: colors.text, fontSize: 13, flex: 1 }}>{card.email}</Text>
                      <Ionicons name="chevron-forward" size={14} color={colors.textFaint} />
                    </TouchableOpacity>
                  )}
                  {card.whatsapp && (
                    <TouchableOpacity
                      onPress={() => handleContact('whatsapp', card.whatsapp)}
                      style={{ flexDirection: 'row', alignItems: 'center', padding: 14, borderBottomWidth: card.instagram || card.linkedin || card.tiktok || card.website ? 1 : 0, borderBottomColor: colors.border2, gap: 12 }}>
                      <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: '#25D36622', alignItems: 'center', justifyContent: 'center' }}>
                        <Ionicons name="logo-whatsapp" size={16} color="#25D366" />
                      </View>
                      <Text style={{ color: colors.text, fontSize: 13, flex: 1 }}>WhatsApp</Text>
                      <Ionicons name="chevron-forward" size={14} color={colors.textFaint} />
                    </TouchableOpacity>
                  )}
                  {card.instagram && (
                    <TouchableOpacity
                      onPress={() => handleContact('instagram', card.instagram)}
                      style={{ flexDirection: 'row', alignItems: 'center', padding: 14, borderBottomWidth: card.linkedin || card.tiktok || card.website ? 1 : 0, borderBottomColor: colors.border2, gap: 12 }}>
                      <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: '#E11D4822', alignItems: 'center', justifyContent: 'center' }}>
                        <Ionicons name="logo-instagram" size={16} color="#E11D48" />
                      </View>
                      <Text style={{ color: colors.text, fontSize: 13, flex: 1 }}>@{card.instagram}</Text>
                      <Ionicons name="chevron-forward" size={14} color={colors.textFaint} />
                    </TouchableOpacity>
                  )}
                  {card.linkedin && (
                    <TouchableOpacity
                      onPress={() => handleContact('linkedin', card.linkedin)}
                      style={{ flexDirection: 'row', alignItems: 'center', padding: 14, borderBottomWidth: card.tiktok || card.website ? 1 : 0, borderBottomColor: colors.border2, gap: 12 }}>
                      <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: '#0A66C222', alignItems: 'center', justifyContent: 'center' }}>
                        <Ionicons name="logo-linkedin" size={16} color="#0A66C2" />
                      </View>
                      <Text style={{ color: colors.text, fontSize: 13, flex: 1 }}>LinkedIn</Text>
                      <Ionicons name="chevron-forward" size={14} color={colors.textFaint} />
                    </TouchableOpacity>
                  )}
                  {card.tiktok && (
                    <TouchableOpacity
                      onPress={() => handleContact('tiktok', card.tiktok)}
                      style={{ flexDirection: 'row', alignItems: 'center', padding: 14, borderBottomWidth: card.website ? 1 : 0, borderBottomColor: colors.border2, gap: 12 }}>
                      <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: '#111', alignItems: 'center', justifyContent: 'center' }}>
                        <Ionicons name="musical-notes-outline" size={16} color="#fff" />
                      </View>
                      <Text style={{ color: colors.text, fontSize: 13, flex: 1 }}>@{card.tiktok}</Text>
                      <Ionicons name="chevron-forward" size={14} color={colors.textFaint} />
                    </TouchableOpacity>
                  )}
                  {card.website && (
                    <TouchableOpacity
                      onPress={() => handleContact('website', card.website)}
                      style={{ flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 }}>
                      <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: colors.surface2, alignItems: 'center', justifyContent: 'center' }}>
                        <Ionicons name="globe-outline" size={16} color={colors.textSecondary} />
                      </View>
                      <Text style={{ color: colors.text, fontSize: 13, flex: 1 }}>{card.website}</Text>
                      <Ionicons name="chevron-forward" size={14} color={colors.textFaint} />
                    </TouchableOpacity>
                  )}
                </View>

                {/* Address */}
                {card.address && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 14, borderWidth: 1, borderColor: colors.border2, padding: 14, marginTop: 8, gap: 12 }}>
                    <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: '#FFBA0022', alignItems: 'center', justifyContent: 'center' }}>
                      <Ionicons name="location-outline" size={16} color="#FFBA00" />
                    </View>
                    <Text style={{ color: colors.text, fontSize: 13, flex: 1 }}>{card.address}</Text>
                  </View>
                )}

                {/* QR code */}
                <TouchableOpacity
                  onPress={() => setExpandedQr(card.id)}
                  style={{ alignItems: 'center', marginTop: 12, marginBottom: 4 }}>
                  <View style={{ backgroundColor: '#fff', padding: 12, borderRadius: 16 }}>
                    <QRCode value={cardLink} size={90} color="#111" backgroundColor="#fff" />
                  </View>
                  <Text style={{ color: colors.textMuted, fontSize: 11, marginTop: 6 }}>Tap to expand QR</Text>
                </TouchableOpacity>

                {/* Action buttons */}
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
                  <TouchableOpacity
                    onPress={() => handleShare(card.id, card.name)}
                    style={{ flex: 1, backgroundColor: colors.primary, padding: 12, borderRadius: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6 }}>
                    <Ionicons name="share-outline" size={16} color="#fff" />
                    <Text style={{ color: '#fff', fontWeight: '600', fontSize: 13 }}>Share</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleCopyLink(card.id)}
                    style={{ flex: 1, backgroundColor: colors.surface, padding: 12, borderRadius: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6, borderWidth: 1, borderColor: colors.border }}>
                    <Ionicons name={copied === card.id ? 'checkmark-outline' : 'link-outline'} size={16} color={copied === card.id ? colors.success : colors.textSecondary} />
                    <Text style={{ color: copied === card.id ? colors.success : colors.textSecondary, fontWeight: '600', fontSize: 13 }}>
                      {copied === card.id ? 'Copied!' : 'Copy link'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => { setSelectedCard(card); setShowSaveModal(true); }}
                    style={{ flex: 1, backgroundColor: colors.surface, padding: 12, borderRadius: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6, borderWidth: 1, borderColor: colors.border }}>
                    <Ionicons name="people-outline" size={16} color={colors.textSecondary} />
                    <Text style={{ color: colors.textSecondary, fontWeight: '600', fontSize: 13 }}>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* QR expanded modal */}
      <Modal visible={!!expandedQr} transparent animationType="fade">
        <TouchableOpacity
          onPress={() => setExpandedQr(null)}
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ backgroundColor: '#fff', padding: 32, borderRadius: 28 }}>
            {expandedQr && (
              <QRCode
                value={`https://dancing-bavarois-5ae1b1.netlify.app/card/${expandedQr}`}
                size={240}
                color="#111"
                backgroundColor="#fff"
              />
            )}
          </View>
          <Text style={{ color: '#555', fontSize: 13, marginTop: 20 }}>Tap anywhere to close</Text>
        </TouchableOpacity>
      </Modal>

      <SaveToGroupModal
        visible={showSaveModal}
        cardId={selectedCard?.id}
        cardName={selectedCard?.name}
        onClose={() => setShowSaveModal(false)}
        onSaved={(groupId) => {
          setShowSaveModal(false);
          router.push({ pathname: '/group-detail', params: { groupId } } as any);
        }}
      />
    </View>
  );
}
