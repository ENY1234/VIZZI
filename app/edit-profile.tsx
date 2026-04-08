import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from './supabase';

export default function EditProfile() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setUserId(user.id);
    setFullName(user.user_metadata?.full_name || '');

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profile) {
      setBio(profile.bio || '');
      setJobTitle(profile.job_title || '');
      setPhoto(profile.avatar_url || null);
      if (profile.full_name) setFullName(profile.full_name);
    }
    setLoading(false);
  }

  async function pickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await uploadPhoto(result.assets[0].uri);
    }
  }

  async function uploadPhoto(uri: string) {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const arrayBuffer = await new Response(blob).arrayBuffer();
      const fileName = `avatar-${userId}.jpg`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, arrayBuffer, { contentType: 'image/jpeg', upsert: true });

      if (uploadError) {
        Alert.alert('Upload failed', uploadError.message);
        return;
      }

      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(fileName);
      setPhoto(urlData.publicUrl);

      await supabase.from('profiles').update({
        avatar_url: urlData.publicUrl
      }).eq('id', userId);

    } catch (err) {
      Alert.alert('Error', 'Could not upload photo');
    }
  }

  async function handleSave() {
  if (!fullName.trim()) {
    Alert.alert('Error', 'Please enter your name');
    return;
  }
  setSaving(true);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    Alert.alert('Error', 'Not logged in');
    setSaving(false);
    return;
  }

  await supabase.auth.updateUser({
    data: { full_name: fullName.trim() }
  });

  const { error } = await supabase
    .from('profiles')
    .upsert({
      id: user.id,
      full_name: fullName.trim(),
      bio: bio.trim(),
      job_title: jobTitle.trim(),
      email: user.email,
    });

  setSaving(false);

  if (error) {
    Alert.alert('Error', error.message);
  } else {
    router.back();
  }
}

  const initials = fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  if (loading) return (
    <View style={{ flex: 1, backgroundColor: '#0d0d0d', alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: '#555' }}>Loading...</Text>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#0d0d0d' }}>
      <ScrollView
        contentContainerStyle={{ padding: 24, paddingTop: 60, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled">

        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 32 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ width: 36, height: 36, borderRadius: 10, borderWidth: 1, borderColor: '#2a2a2a', alignItems: 'center', justifyContent: 'center', marginRight: 14 }}>
            <Ionicons name="arrow-back" size={18} color="#888" />
          </TouchableOpacity>
          <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>Edit profile</Text>
        </View>

        {/* Photo */}
        <View style={{ alignItems: 'center', marginBottom: 32 }}>
          <TouchableOpacity onPress={pickImage}>
            {photo ? (
              <Image
                source={{ uri: photo }}
                style={{ width: 90, height: 90, borderRadius: 45 }}
              />
            ) : (
              <View style={{ width: 90, height: 90, borderRadius: 45, backgroundColor: '#FF5C87', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: '#fff', fontSize: 30, fontWeight: 'bold' }}>{initials || '?'}</Text>
              </View>
            )}
            <View style={{ position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: 14, backgroundColor: '#FF5C87', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#0d0d0d' }}>
              <Ionicons name="camera-outline" size={14} color="#fff" />
            </View>
          </TouchableOpacity>
          <Text style={{ color: '#555', fontSize: 12, marginTop: 8 }}>Tap to change photo</Text>
        </View>

        <Text style={{ color: '#555', fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 }}>Personal info</Text>

        <TextInput
          value={fullName}
          onChangeText={setFullName}
          placeholder="Full name"
          placeholderTextColor="#555"
          returnKeyType="done"
          blurOnSubmit={true}
          style={{ backgroundColor: '#1a1a1a', color: '#fff', padding: 14, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#2a2a2a' }}
        />

        <TextInput
          value={jobTitle}
          onChangeText={setJobTitle}
          placeholder="Job title"
          placeholderTextColor="#555"
          returnKeyType="done"
          blurOnSubmit={true}
          style={{ backgroundColor: '#1a1a1a', color: '#fff', padding: 14, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#2a2a2a' }}
        />

        <TextInput
          value={bio}
          onChangeText={setBio}
          placeholder="Bio — tell people about yourself"
          placeholderTextColor="#555"
          multiline
          numberOfLines={3}
          style={{ backgroundColor: '#1a1a1a', color: '#fff', padding: 14, borderRadius: 12, marginBottom: 24, borderWidth: 1, borderColor: '#2a2a2a', minHeight: 80, textAlignVertical: 'top' }}
        />

        <TouchableOpacity
          onPress={handleSave}
          disabled={saving}
          style={{ backgroundColor: '#FF5C87', padding: 16, borderRadius: 14, alignItems: 'center', opacity: saving ? 0.6 : 1 }}>
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>
            {saving ? 'Saving...' : 'Save changes'}
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}