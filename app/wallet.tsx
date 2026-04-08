import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Modal, Text, TextInput, TouchableOpacity, View } from 'react-native';
import DraggableFlatList, { ScaleDecorator } from 'react-native-draggable-flatlist';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BottomNav from './components/BottomNav';
import CardPreview from './components/CardPreview';
import SwipeableRow from './components/SwipeableRow';
import { useTheme } from './context/ThemeContext';
import { supabase } from './supabase';

const GROUP_COLORS = [
  '#FF5C87', '#3B82F6', '#10B981', '#FFBA00',
  '#A855F7', '#06b6d4', '#F97316', '#E24B4A',
];

export default function Wallet() {
  const router = useRouter();
  const { colors } = useTheme();

  const [activeTab, setActiveTab] = useState<'my' | 'groups'>('my');
  const [myCards, setMyCards] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [savedCards, setSavedCards] = useState<any[]>([]);
  const [showNewGroup, setShowNewGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupColor, setNewGroupColor] = useState('#FF5C87');
  const [groupNameError, setGroupNameError] = useState('');
  const [loadingCards, setLoadingCards] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setLoadingCards(true);
    const { data: cards } = await supabase
      .from('cards')
      .select('*')
      .eq('user_id', user.id)
      .order('order', { ascending: true });
    if (cards) setMyCards(cards);
    setLoadingCards(false);

    const { data: grps } = await supabase
      .from('groups')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });
    if (grps) setGroups(grps);

    const { data: saved } = await supabase
      .from('saved_cards')
      .select('*, cards(*)')
      .eq('user_id', user.id);
    if (saved) setSavedCards(saved);
  }

  async function saveCardOrder(newCards: any[]) {
    setMyCards(newCards);
    for (let i = 0; i < newCards.length; i++) {
      await supabase.from('cards').update({ order: i }).eq('id', newCards[i].id);
    }
  }

  async function createGroup() {
    if (!newGroupName.trim()) {
      setGroupNameError('Please enter a group name');
      return;
    }
    const duplicate = groups.find(
      g => g.name.toLowerCase() === newGroupName.trim().toLowerCase()
    );
    if (duplicate) {
      setGroupNameError('A group with this name already exists');
      return;
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from('groups').insert({
      user_id: user.id,
      name: newGroupName.trim(),
      color: newGroupColor,
    });

    if (!error) {
      setNewGroupName('');
      setNewGroupColor('#FF5C87');
      setGroupNameError('');
      setShowNewGroup(false);
      loadData();
    } else {
      setGroupNameError('Something went wrong: ' + error.message);
    }
  }

  async function deleteGroup(groupId: string) {
    Alert.alert('Delete group', 'Are you sure? Cards in this group will be removed.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          await supabase.from('saved_cards').delete().eq('group_id', groupId);
          await supabase.from('groups').delete().eq('id', groupId);
          loadData();
        }
      }
    ]);
  }

  async function deleteCard(cardId: string) {
    Alert.alert('Delete card', 'Are you sure? This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          await supabase.from('cards').delete().eq('id', cardId);
          loadData();
        }
      }
    ]);
  }

  const cardsInGroup = (groupId: string) =>
    savedCards.filter(sc => sc.group_id === groupId);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flex: 1 }}>

        <View style={{ padding: 20, paddingTop: 60 }}>
          <Text style={{ color: colors.text, fontSize: 22, fontWeight: 'bold' }}>Wallet</Text>
          <Text style={{ color: colors.textMuted, fontSize: 13, marginTop: 2 }}>Your cards and contacts</Text>
        </View>

        <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 20, marginBottom: 20 }}>
          <TouchableOpacity
            onPress={() => setActiveTab('my')}
            style={{ flex: 1, padding: 10, borderRadius: 12, backgroundColor: activeTab === 'my' ? colors.primary : colors.surface, alignItems: 'center', borderWidth: 1, borderColor: activeTab === 'my' ? colors.primary : colors.border }}>
            <Text style={{ color: activeTab === 'my' ? colors.text : colors.textMuted, fontSize: 13, fontWeight: '600' }}>My cards</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab('groups')}
            style={{ flex: 1, padding: 10, borderRadius: 12, backgroundColor: activeTab === 'groups' ? colors.primary : colors.surface, alignItems: 'center', borderWidth: 1, borderColor: activeTab === 'groups' ? colors.primary : colors.border }}>
            <Text style={{ color: activeTab === 'groups' ? colors.text : colors.textMuted, fontSize: 13, fontWeight: '600' }}>Groups</Text>
          </TouchableOpacity>
        </View>

        {/* MY CARDS TAB */}
        {activeTab === 'my' && (
          loadingCards ? (
            <View style={{ paddingHorizontal: 20 }}>
              {[1, 2].map((i) => (
                <View key={i} style={{ height: 96, borderRadius: 16, backgroundColor: colors.surface, marginBottom: 12 }} />
              ))}
            </View>
          ) : myCards.length === 0 ? (
            <View style={{ alignItems: 'center', paddingVertical: 40 }}>
              <Ionicons name="card-outline" size={40} color={colors.textFaint} />
              <Text style={{ color: colors.textMuted, fontSize: 13, marginTop: 12, textAlign: 'center' }}>
                No cards yet.{'\n'}Create one from the home screen.
              </Text>
            </View>
          ) : (
            <DraggableFlatList
              data={myCards}
              keyExtractor={(item) => item.id}
              onDragEnd={({ data }) => saveCardOrder(data)}
              contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
              renderItem={({ item: card, drag, isActive }) => (
                <ScaleDecorator>
                  <SwipeableRow onDelete={() => deleteCard(card.id)} deleteLabel="Delete">
                    <TouchableOpacity
                      onPress={() => router.push(`/card-ready?cardId=${card.id}&from=wallet` as any)}
                      onLongPress={drag}
                      disabled={isActive}
                      style={{ marginBottom: 16, opacity: isActive ? 0.9 : 1 }}>
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
                      <View style={{ position: 'absolute', top: 12, right: 12, opacity: 0.4 }}>
                        <Ionicons name="reorder-three-outline" size={20} color={colors.text} />
                      </View>
                    </TouchableOpacity>
                  </SwipeableRow>
                </ScaleDecorator>
              )}
            />
          )
        )}

        {/* GROUPS TAB */}
        {activeTab === 'groups' && (
          <View style={{ flex: 1, paddingHorizontal: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <Text style={{ color: colors.textMuted, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase' }}>
                {groups.length} {groups.length === 1 ? 'group' : 'groups'}
              </Text>
              <TouchableOpacity
                onPress={() => { setShowNewGroup(true); setGroupNameError(''); }}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Ionicons name="add" size={16} color={colors.primary} />
                <Text style={{ color: colors.primary, fontSize: 12 }}>New group</Text>
              </TouchableOpacity>
            </View>

            {groups.length === 0 ? (
              <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                <Ionicons name="people-outline" size={40} color={colors.textFaint} />
                <Text style={{ color: colors.textMuted, fontSize: 13, marginTop: 12, textAlign: 'center' }}>
                  No groups yet.{'\n'}Create one to organize your contacts.
                </Text>
              </View>
            ) : (
              <DraggableFlatList
                data={groups}
                keyExtractor={(item) => item.id}
                onDragEnd={({ data }) => setGroups(data)}
                contentContainerStyle={{ paddingBottom: 100 }}
                renderItem={({ item: group, drag, isActive }) => (
                  <ScaleDecorator>
                    <SwipeableRow onDelete={() => deleteGroup(group.id)} deleteLabel="Delete">
                      <TouchableOpacity
                        onPress={() => router.push({ pathname: '/group-detail', params: { groupId: group.id } } as any)}
                        onLongPress={drag}
                        disabled={isActive}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          backgroundColor: colors.surface,
                          borderWidth: 1,
                          borderColor: colors.border2,
                          borderRadius: 16,
                          padding: 16,
                          borderLeftWidth: 4,
                          borderLeftColor: group.color || colors.primary,
                          marginBottom: 12,
                          opacity: isActive ? 0.9 : 1,
                        }}>
                        <View style={{ flex: 1 }}>
                          <Text style={{ color: colors.text, fontSize: 14, fontWeight: '700' }}>{group.name}</Text>
                          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 6 }}>
                            {cardsInGroup(group.id).slice(0, 3).map((sc, i) => (
                              <View key={i} style={{
                                width: 22, height: 22, borderRadius: 6,
                                backgroundColor: sc.cards?.theme || group.color || colors.primary,
                                alignItems: 'center', justifyContent: 'center',
                                borderWidth: 1.5, borderColor: colors.background
                              }}>
                                <Text style={{ color: colors.text, fontSize: 8, fontWeight: 'bold' }}>{sc.label?.charAt(0) || '?'}</Text>
                              </View>
                            ))}
                            {cardsInGroup(group.id).length > 3 && (
                              <Text style={{ color: colors.textMuted, fontSize: 10 }}>+{cardsInGroup(group.id).length - 3}</Text>
                            )}
                            {cardsInGroup(group.id).length === 0 && (
                              <Text style={{ color: colors.textFaint, fontSize: 10 }}>No cards yet</Text>
                            )}
                          </View>
                        </View>
                        <View style={{ alignItems: 'flex-end', gap: 6 }}>
                          <Ionicons name="reorder-three-outline" size={18} color={colors.textFaint} />
                          <Text style={{ color: colors.textMuted, fontSize: 10 }}>
                            {cardsInGroup(group.id).length} {cardsInGroup(group.id).length === 1 ? 'card' : 'cards'}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    </SwipeableRow>
                  </ScaleDecorator>
                )}
              />
            )}
          </View>
        )}

      </View>

      {/* New group modal */}
      <Modal visible={showNewGroup} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <View style={{ width: '100%', backgroundColor: colors.surface, borderRadius: 20, padding: 24, borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ color: colors.text, fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>New group</Text>

            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: colors.surface2,
              borderRadius: 14,
              padding: 14,
              marginBottom: 16,
              borderWidth: 1,
              borderColor: colors.border,
              borderLeftWidth: 4,
              borderLeftColor: newGroupColor,
            }}>
              <Text style={{ color: newGroupName.trim() ? colors.text : colors.textFaint, fontSize: 14, fontWeight: '700', flex: 1 }}>
                {newGroupName.trim() || 'Group name'}
              </Text>
              <Text style={{ color: colors.textMuted, fontSize: 11 }}>0 cards</Text>
            </View>

            <TextInput
              value={newGroupName}
              onChangeText={(text) => { setNewGroupName(text); setGroupNameError(''); }}
              placeholder="Group name (e.g. Clients)"
              placeholderTextColor={colors.textFaint}
              autoFocus
              returnKeyType="done"
              blurOnSubmit={true}
              style={{
                backgroundColor: colors.surface2,
                color: colors.text,
                padding: 14,
                borderRadius: 12,
                marginBottom: 8,
                borderWidth: 1,
                borderColor: groupNameError ? colors.danger : colors.border
              }}
            />

            {groupNameError ? (
              <Text style={{ color: colors.danger, fontSize: 11, marginBottom: 12 }}>{groupNameError}</Text>
            ) : (
              <View style={{ marginBottom: 12 }} />
            )}

            <Text style={{ color: colors.textMuted, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 }}>Color</Text>
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
              {GROUP_COLORS.map((color) => (
                <TouchableOpacity
                  key={color}
                  onPress={() => setNewGroupColor(color)}
                  style={{
                    width: 32, height: 32, borderRadius: 16,
                    backgroundColor: color,
                    borderWidth: newGroupColor === color ? 3 : 1.5,
                    borderColor: newGroupColor === color ? colors.text : 'transparent',
                  }}
                />
              ))}
            </View>

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity
                onPress={() => { setShowNewGroup(false); setNewGroupName(''); setGroupNameError(''); setNewGroupColor('#FF5C87'); }}
                style={{ flex: 1, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: colors.border, alignItems: 'center' }}>
                <Text style={{ color: colors.textMuted }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={createGroup}
                style={{ flex: 1, padding: 14, borderRadius: 12, backgroundColor: newGroupName.trim() ? colors.primary : colors.surface2, alignItems: 'center' }}>
                <Text style={{ color: newGroupName.trim() ? colors.text : colors.textMuted, fontWeight: 'bold' }}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <BottomNav active="wallet" />
    </GestureHandlerRootView>
  );
}