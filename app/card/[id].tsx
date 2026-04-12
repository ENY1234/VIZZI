import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Linking, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../supabase';

export default function CardWebPage() {
  const { id } = useLocalSearchParams();
  const [card, setCard] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getCard() {
      if (!id) return;
      const { data } = await supabase.from('cards').select('*').eq('id', id).single();
      if (data) setCard(data);
      setLoading(false);
    }
    getCard();
  }, [id]);

  if (loading) return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0a0a0a' }}>
      <ActivityIndicator color="#FF5C87" />
    </View>
  );

  if (!card) return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0a0a0a' }}>
      <Text style={{ color: '#fff', fontSize: 18 }}>Card not found</Text>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#0a0a0a', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <Text style={{ fontSize: 32, fontWeight: 'bold', color: '#fff', letterSpacing: -1 }}>
        vizzi<Text style={{ color: '#FF5C87' }}>.</Text>
      </Text>
      <Text style={{ color: '#555', fontSize: 13, marginBottom: 40 }}>digital business card</Text>

      <View style={{ width: '100%', maxWidth: 360, backgroundColor: card.theme || '#FF5C87', borderRadius: 20, padding: 24, marginBottom: 32 }}>
        <Text style={{ color: '#fff', fontSize: 22, fontWeight: 'bold' }}>{card.name}</Text>
        <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, marginTop: 4 }}>{card.job_title}</Text>
        {card.phone && <Text style={{ color: '#fff', fontSize: 14, marginTop: 16 }}>📞 {card.phone}</Text>}
        {card.email && <Text style={{ color: '#fff', fontSize: 14, marginTop: 8 }}>✉️ {card.email}</Text>}
        {card.address && <Text style={{ color: '#fff', fontSize: 14, marginTop: 8 }}>📍 {card.address}</Text>}
        {card.website && <Text style={{ color: '#fff', fontSize: 14, marginTop: 8 }}>🌐 {card.website}</Text>}
        {card.instagram && <Text style={{ color: '#fff', fontSize: 14, marginTop: 8 }}>📸 @{card.instagram}</Text>}
        {card.whatsapp && (
          <TouchableOpacity onPress={() => Linking.openURL(`https://wa.me/${card.whatsapp}`)}>
            <Text style={{ color: '#fff', fontSize: 14, marginTop: 8 }}>💬 WhatsApp</Text>
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity
        onPress={() => Linking.openURL(`vizzi://card/${id}`)}
        style={{ backgroundColor: '#FF5C87', padding: 16, borderRadius: 14, width: '100%', maxWidth: 360, alignItems: 'center', marginBottom: 12 }}>
        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 15 }}>Open in Vizzi app</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => Linking.openURL('https://vizzi-jxy7krapt-eny1234s-projects.vercel.app')}
        style={{ padding: 12 }}>
        <Text style={{ color: '#555', fontSize: 13 }}>Get the Vizzi app</Text>
      </TouchableOpacity>
    </View>
  );
}