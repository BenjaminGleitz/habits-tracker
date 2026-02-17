import { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AppStackParamList } from '../types/navigation';
import { supabase } from '../services/supabaseClient';
import { createHabit } from '../services/habitService';

type Props = NativeStackScreenProps<AppStackParamList, 'HabitForm'>;

export default function HabitFormScreen({ navigation }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    if (!title.trim()) {
      Alert.alert('Erreur', 'Le titre est obligatoire');
      return;
    }

    setLoading(true);

    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    const session = sessionData.session;

    if (sessionError || !session) {
      setLoading(false);
      Alert.alert('Erreur', 'Session invalide. Reconnecte-toi.');
      return;
    }

    const { error } = await createHabit(session, title.trim(), description.trim() || undefined);

    setLoading(false);

    if (error) {
      Alert.alert('Erreur', error.message);
      return;
    }

    navigation.goBack();
  }

  return (
      <View style={styles.container}>
        <Text style={styles.title}>Nouvelle habitude</Text>

        <TextInput
            style={styles.input}
            placeholder="Titre"
            value={title}
            onChangeText={setTitle}
        />

        <TextInput
            style={[styles.input, styles.textarea]}
            placeholder="Description (optionnel)"
            value={description}
            onChangeText={setDescription}
            multiline
        />

        <Button
            title={loading ? 'Enregistrement...' : 'Enregistrer'}
            onPress={handleSave}
        />
      </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, gap: 12 },
  title: { fontSize: 22, fontWeight: '600', marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 10,
  },
  textarea: {
    height: 90,
    textAlignVertical: 'top',
  },
});
