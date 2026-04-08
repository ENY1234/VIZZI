import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, FlatList, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import CardPreview from './components/CardPreview';
import SwipeableRow from './components/SwipeableRow';
import { useTheme } from './context/ThemeContext';
import { supabase } from './supabase';

const GROUP_COLORS = [
  '#FF5C87', '#3B82F6', '#10B981', '#FFBA00',
  '#A855F7', '#06b6d4', '#F97316', '#E24B4A',
];

export default function GroupDetail() {
  const router = useRouter();
  const { colors } = useTheme();
  const params = useLocalSearchParams();
  const groupId = params.groupId as string;

  const [savedCards, setSavedCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [showAddCards, setShowAddCards] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editNameError, setEditNameError] = useState('');
  const [groupData, setGroupData] = useState<any>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('#FF5C87');
  const [allCards, setAllCards] = useState<any[]>([]);
  const [addingCard, setAddingCard] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadGroup();
      loadCards();
    }, [groupId])
  );

  async function loadGroup() {
    const { data, error } = await supabase.from('groups').select('*').eq('id', groupId).single();
    if (data) {
      setGroupData(data);
      setEditName(data.name);
      setEditColor(data.color || '#FF5C87');
    } else {
      setGroupData({ name: 'Group', color: '#FF5C87' });
    }
  }

  async function loadCards() {
    const { data } = await supabase.from('saved_cards').select('*, cards(*)').eq('group_id', groupId);
    if (data) setSavedCards(data);
    setLoading(false);
  }

  async function loadAllCards() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from('cards').select('*').eq('user_id', user.id);
    if (data) {
      const savedCardIds = savedCards.map(sc => sc.card_id);
      setAllCards(data.filter(c => !savedCardIds.includes(c.id)));
    }
  }

  async function saveGroupEdits() {
    if (!editName.trim()) { setEditNameError('Please enter a group name'); return; }
    setSaving(true);
    const { error } = await supabase.from('groups').update({ name: editName.trim(), color: editColor }).eq('id', groupId);
    setSaving(false);
    if (!error) {
      setGroupData({ ...groupData, name: editName.trim(), color: editColor });
      setShowEdit(false);
      setEditNameError('');
    } else {
      setEditNameError('Something went wrong: ' + error.message);
    }
  }

  async function removeCard(savedCardId: string) {
    Alert.alert('Remove card', 'Remove this card from the group?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove', style: 'destructive',
        onPress: async () => {
          await supabase.from('saved_cards').delete().eq('id', savedCardId);
          loadCards();
        }
      }
    ]);
  }

  async function addCardToGroup(card: any) {
    setAddingCard(card.id);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('saved_cards').insert({
      user_id: user.id,
      card_id: card.id,
      label: card.name,
      group_id: groupId,
    });
    setAddingCard(null);
    setShowAddCards(false);
    loadCards();
  }

  if (!groupData) return (
    <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: colors.textMuted }}>Loading...</Text>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: 24, paddingTop: 60, paddingBottom: 40 }}>

        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 28 }}>
          <TouchableOpacity
            onPress={() => router.push('/wallet' as any)}
            style={{ width: 36, height: 36, borderRadius: 10, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', marginRight: 14 }}>
            <Ionicons name="arrow-back" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
            <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: groupData.color || colors.primary }} />
            <Text style={{ color: colors.text, fontSize: 20, fontWeight: 'bold' }}>{groupData.name}</Text>
          </View>
          <TouchableOpacity
            onPress={() => { setShowEdit(true); setEditNameError(''); setEditName(groupData.name); setEditColor(groupData.color || '#FF5C87'); }}
            style={{ width: 36, height: 36, borderRadius: 10, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="create-outline" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <Text style={{ color: colors.textMuted, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase' }}>
            {savedCards.length} {savedCards.length === 1 ? 'card' : 'cards'}
          </Text>
          <TouchableOpacity
            onPress={() => { loadAllCards(); setShowAddCards(true); }}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Ionicons name="add" size={16} color={colors.primary} />
            <Text style={{ color: colors.primary, fontSize: 12 }}>Add card</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <Text style={{ color: colors.textMuted, textAlign: 'center', marginTop: 40 }}>Loading...</Text>
        ) : savedCards.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: 60 }}>
            <Ionicons name="people-outline" size={40} color={colors.textFaint} />
            <Text style={{ color: colors.textMuted, fontSize: 13, marginTop: 12, textAlign: 'center' }}>
              No cards in this group yet.{'\n'}Tap "Add card" to add one.
            </Text>
          </View>
        ) : (
          savedCards.map((sc) => (
            <SwipeableRow key={sc.id} onDelete={() => removeCard(sc.id)} deleteLabel="Remove">
              <View style={{ marginBottom: 28 }}>
                <Text style={{ color: colors.textMuted, fontSize: 11, letterSpacing: 0.5, marginBottom: 8 }}>{sc.label}</Text>
                <TouchableOpacity
                  onPress={() => router.push(`/card-ready?cardId=${sc.cards?.id}&from=group&groupId=${groupId}` as any)}>
                  <CardPreview
                    layout={sc.cards?.layout || 'classic'}
                    color={sc.cards?.theme || '#FF5C87'}
                    name={sc.cards?.name || ''}
                    role={sc.cards?.job_title || ''}
                    phone={sc.cards?.phone}
                    email={sc.cards?.email}
                    address={sc.cards?.address}
                    instagram={sc.cards?.instagram}
                    linkedin={sc.cards?.linkedin}
                    whatsapp={sc.cards?.whatsapp}
                    website={sc.cards?.website}
                    tiktok={sc.cards?.tiktok}
                    businessType={sc.cards?.business_type || 'other'}
                  />
                </TouchableOpacity>
              </View>
            </SwipeableRow>
          ))
        )}
      </ScrollView>

      {/* Add cards modal */}
      <Modal visible={showAddCards} transparent animationType="slide">
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View style={{ backgroundColor: colors.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 40, maxHeight: '80%', borderTopWidth: 1, borderColor: colors.border2 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <Text style={{ color: colors.text, fontSize: 18, fontWeight: 'bold' }}>Add a card</Text>
              <TouchableOpacity onPress={() => setShowAddCards(false)}>
                <Ionicons name="close" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            {allCards.length === 0 ? (
              <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                <Text style={{ color: colors.textMuted, fontSize: 13, textAlign: 'center' }}>
                  All your cards are already in this group or you have no cards yet.
                </Text>
              </View>
            ) : (
              <FlatList
                data={allCards}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                renderItem={({ item: card }) => (
                  <View style={{ marginBottom: 16 }}>
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
                      onPress={() => addCardToGroup(card)}
                      disabled={addingCard === card.id}
                      style={{ marginTop: 8, padding: 12, borderRadius: 12, backgroundColor: colors.primary, alignItems: 'center', opacity: addingCard === card.id ? 0.6 : 1 }}>
                      <Text style={{ color: '#fff', fontSize: 13, fontWeight: '600' }}>
                        {addingCard === card.id ? 'Adding...' : 'Add to group'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              />
            )}
          </View>
        </View>
      </Modal>

      {/* Edit group modal */}
      <Modal visible={showEdit} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <View style={{ width: '100%', backgroundColor: colors.surface, borderRadius: 20, padding: 24, borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ color: colors.text, fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>Edit group</Text>

            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface2, borderRadius: 14, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: colors.border, borderLeftWidth: 4, borderLeftColor: editColor }}>
              <Text style={{ color: editName.trim() ? colors.text : colors.textFaint, fontSize: 14, fontWeight: '700', flex: 1 }}>
                {editName.trim() || 'Group name'}
              </Text>
              <Text style={{ color: colors.textMuted, fontSize: 11 }}>{savedCards.length} cards</Text>
            </View>

            <TextInput
              value={editName}
              onChangeText={(text) => { setEditName(text); setEditNameError(''); }}
              placeholder="Group name"
              placeholderTextColor={colors.textMuted}
              returnKeyType="done"
              blurOnSubmit={true}
              style={{ backgroundColor: colors.surface2, color: colors.text, padding: 14, borderRadius: 12, marginBottom: 8, borderWidth: 1, borderColor: editNameError ? colors.danger : colors.border }}
            />

            {editNameError ? (
              <Text style={{ color: colors.danger, fontSize: 11, marginBottom: 12 }}>{editNameError}</Text>
            ) : <View style={{ marginBottom: 12 }} />}

            <Text style={{ color: colors.textMuted, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 }}>Color</Text>
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
              {GROUP_COLORS.map((color) => (
                <TouchableOpacity
                  key={color}
                  onPress={() => setEditColor(color)}
                  style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: color, borderWidth: editColor === color ? 3 : 1.5, borderColor: editColor === color ? '#fff' : 'transparent' }}
                />
              ))}
            </View>

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity
                onPress={() => { setShowEdit(false); setEditNameError(''); }}
                style={{ flex: 1, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: colors.border, alignItems: 'center' }}>
                <Text style={{ color: colors.textMuted }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={saveGroupEdits}
                style={{ flex: 1, padding: 14, borderRadius: 12, backgroundColor: editName.trim() ? colors.primary : colors.surface2, alignItems: 'center', opacity: saving ? 0.6 : 1 }}>
                <Text style={{ color: editName.trim() ? '#fff' : colors.textMuted, fontWeight: 'bold' }}>
                  {saving ? 'Saving...' : 'Save'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}