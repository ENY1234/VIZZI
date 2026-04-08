import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Alert, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../supabase';

const GROUP_COLORS = [
  '#FF5C87', '#3B82F6', '#10B981', '#FFBA00',
  '#A855F7', '#06b6d4', '#F97316', '#E24B4A',
];

type Props = {
  visible: boolean;
  cardId: string | null;
  cardName: string;
  onClose: () => void;
  onSaved: (groupId: string) => void;
};

export default function SaveToGroupModal({ visible, cardId, cardName, onClose, onSaved }: Props) {
  const [groups, setGroups] = useState<any[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [label, setLabel] = useState('');
  const [saving, setSaving] = useState(false);
  const [showNewGroup, setShowNewGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupColor, setNewGroupColor] = useState('#FF5C87');
  const [creatingGroup, setCreatingGroup] = useState(false);

  useEffect(() => {
    if (visible) {
      loadGroups();
      setLabel(cardName || '');
      setSelectedGroup(null);
      setShowNewGroup(false);
      setNewGroupName('');
    }
  }, [visible]);

  async function loadGroups() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from('groups')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });
    if (data) setGroups(data);
  }

  async function createAndSelectGroup() {
    if (!newGroupName.trim()) return;
    setCreatingGroup(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data, error } = await supabase.from('groups').insert({
      user_id: user.id,
      name: newGroupName.trim(),
      color: newGroupColor,
    }).select().single();
    setCreatingGroup(false);
    if (!error && data) {
      setGroups(prev => [...prev, data]);
      setSelectedGroup(data.id);
      setShowNewGroup(false);
      setNewGroupName('');
    }
  }

  async function handleSave() {
    if (!cardId || !selectedGroup) return;
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from('saved_cards').insert({
      user_id: user.id,
      card_id: cardId,
      label: label || cardName,
      group_id: selectedGroup,
    });

    setSaving(false);

    if (error) {
      Alert.alert('Error', 'Could not save: ' + error.message);
      return;
    }

    onSaved(selectedGroup);
  }

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <View style={{ backgroundColor: '#141414', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 40, borderTopWidth: 1, borderColor: '#222', maxHeight: '85%' }}>
          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

            <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>Save to group</Text>

            <Text style={{ color: '#555', fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>Your label</Text>
            <TextInput
              value={label}
              onChangeText={setLabel}
              placeholder="e.g. Karim barber Casa"
              placeholderTextColor="#555"
              returnKeyType="done"
              blurOnSubmit={true}
              style={{ backgroundColor: '#1a1a1a', color: '#fff', padding: 14, borderRadius: 12, marginBottom: 20, borderWidth: 1, borderColor: '#2a2a2a' }}
            />

            <Text style={{ color: '#555', fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 }}>Pick a group</Text>

            <View style={{ gap: 8, marginBottom: 12 }}>
              {groups.map((group) => (
                <TouchableOpacity
                  key={group.id}
                  onPress={() => { setSelectedGroup(group.id); setShowNewGroup(false); }}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 14,
                    borderRadius: 14,
                    backgroundColor: '#1a1a1a',
                    borderWidth: 2,
                    borderLeftWidth: 4,
                    borderColor: selectedGroup === group.id ? '#FF5C87' : '#222',
                    borderLeftColor: group.color || '#FF5C87',
                  }}>
                  <Text style={{ color: '#fff', fontSize: 13, fontWeight: '600', flex: 1 }}>{group.name}</Text>
                  {selectedGroup === group.id && (
                    <Ionicons name="checkmark-circle" size={18} color="#FF5C87" />
                  )}
                </TouchableOpacity>
              ))}

              {!showNewGroup ? (
                <TouchableOpacity
                  onPress={() => { setShowNewGroup(true); setSelectedGroup(null); }}
                  style={{ flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 14, backgroundColor: '#1a1a1a', borderWidth: 1.5, borderColor: '#2a2a2a', borderStyle: 'dashed', gap: 8 }}>
                  <Ionicons name="add" size={18} color="#FF5C87" />
                  <Text style={{ color: '#FF5C87', fontSize: 13, fontWeight: '600' }}>Create new group</Text>
                </TouchableOpacity>
              ) : (
                <View style={{ backgroundColor: '#1a1a1a', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#FF5C87' }}>
                  <TextInput
                    value={newGroupName}
                    onChangeText={setNewGroupName}
                    placeholder="Group name"
                    placeholderTextColor="#555"
                    returnKeyType="done"
                    blurOnSubmit={true}
                    autoFocus
                    style={{ color: '#fff', fontSize: 13, marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#2a2a2a', paddingBottom: 8 }}
                  />
                  <Text style={{ color: '#555', fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>Color</Text>
                  <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                    {GROUP_COLORS.map((color) => (
                      <TouchableOpacity
                        key={color}
                        onPress={() => setNewGroupColor(color)}
                        style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: color, borderWidth: newGroupColor === color ? 3 : 1.5, borderColor: newGroupColor === color ? '#fff' : 'transparent' }}
                      />
                    ))}
                  </View>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <TouchableOpacity
                      onPress={() => { setShowNewGroup(false); setNewGroupName(''); }}
                      style={{ flex: 1, padding: 10, borderRadius: 10, borderWidth: 1, borderColor: '#2a2a2a', alignItems: 'center' }}>
                      <Text style={{ color: '#555', fontSize: 12 }}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={createAndSelectGroup}
                      disabled={!newGroupName.trim() || creatingGroup}
                      style={{ flex: 1, padding: 10, borderRadius: 10, backgroundColor: newGroupName.trim() ? '#FF5C87' : '#333', alignItems: 'center' }}>
                      <Text style={{ color: newGroupName.trim() ? '#fff' : '#555', fontSize: 12, fontWeight: 'bold' }}>
                        {creatingGroup ? 'Creating...' : 'Create'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>

            <TouchableOpacity
              onPress={handleSave}
              disabled={saving || !selectedGroup}
              style={{ backgroundColor: '#FF5C87', padding: 16, borderRadius: 14, alignItems: 'center', marginBottom: 10, marginTop: 8, opacity: (saving || !selectedGroup) ? 0.5 : 1 }}>
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 15 }}>
                {saving ? 'Saving...' : 'Save to group'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onClose}
              style={{ padding: 14, borderRadius: 14, alignItems: 'center' }}>
              <Text style={{ color: '#555', fontSize: 14 }}>Cancel</Text>
            </TouchableOpacity>

          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}