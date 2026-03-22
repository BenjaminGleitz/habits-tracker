import { useCallback, useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, ActivityIndicator, Pressable } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AppStackParamList } from '../types/navigation';
import { supabase } from '../services/supabaseClient';
import { createHabit, getHabitById, updateHabit } from '../services/habitService';
import { colors, elevation, radii, spacing } from '../theme';

type Props = NativeStackScreenProps<AppStackParamList, 'HabitForm'>;

export default function HabitFormScreen({ navigation, route }: Props) {
  const habitId = route.params?.habitId;
  const isEdit = !!habitId;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEdit);

  const loadForEdit = useCallback(async () => {
    if (!habitId) return;

    setInitialLoading(true);
    const { data, error } = await getHabitById(habitId);

    if (error) {
      Alert.alert('Erreur', error.message);
    } else if (data) {
      setTitle(data.title ?? '');
      setDescription(data.description ?? '');
    }

    setInitialLoading(false);
  }, [habitId]);

  useEffect(() => {
    if (isEdit) {
      navigation.setOptions({ title: 'Modifier' });
      loadForEdit();
    } else {
      navigation.setOptions({ title: 'Nouvelle habitude' });
    }
  }, [isEdit, loadForEdit, navigation]);

  async function handleSave() {
    if (!title.trim()) {
      Alert.alert('Erreur', 'Le titre est obligatoire');
      return;
    }

    setLoading(true);

    if (isEdit && habitId) {
      const { error } = await updateHabit(habitId, {
        title: title.trim(),
        description: description.trim() || null,
      });

      setLoading(false);

      if (error) {
        Alert.alert('Erreur', error.message);
        return;
      }

      navigation.goBack();
      return;
    }

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

  if (initialLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.label}>Titre</Text>
        <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Ex: Lire 20 min" placeholderTextColor={colors.textMuted} />

        <Text style={styles.label}>Description (optionnel)</Text>
        <TextInput
          style={[styles.input, styles.textarea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Ex: avant de dormir"
          placeholderTextColor={colors.textMuted}
          multiline
        />

        <Pressable style={({ pressed }) => [styles.saveButton, pressed && styles.saveButtonPressed]} onPress={handleSave}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>{isEdit ? 'Enregistrer' : 'Créer'}</Text>}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg, backgroundColor: colors.background },
  card: {
    gap: spacing.sm,
    backgroundColor: colors.surfaceStrong,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    ...elevation.card,
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  label: { fontWeight: '700', color: colors.text },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    color: colors.text,
  },
  textarea: { height: 90, textAlignVertical: 'top' },
  saveButton: {
    marginTop: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveButtonPressed: { backgroundColor: colors.primaryPressed },
  saveButtonText: { color: '#fff', fontWeight: '700' },
});
