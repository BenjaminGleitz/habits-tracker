import { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, Pressable } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AppStackParamList } from '../types/navigation';
import { getHabitById, deleteHabit } from '../services/habitService';
import { colors, spacing } from '../theme';

type Props = NativeStackScreenProps<AppStackParamList, 'HabitDetail'>;

export default function HabitDetailScreen({ route, navigation }: Props) {
  const { habitId } = route.params;

  const [loading, setLoading] = useState(true);
  const [habit, setHabit] = useState<{ id: string; title: string; description: string | null } | null>(null);

  const loadHabit = useCallback(async () => {
    setLoading(true);

    const { data, error } = await getHabitById(habitId);

    if (error) {
      Alert.alert('Erreur', error.message);
    } else {
      setHabit(data);
    }

    setLoading(false);
  }, [habitId]);

  useFocusEffect(
      useCallback(() => {
        loadHabit();
      }, [loadHabit])
  );

  async function handleDelete() {
    Alert.alert('Supprimer', 'Tu veux supprimer cette habitude ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          const { error } = await deleteHabit(habitId);
          if (error) {
            Alert.alert('Erreur', error.message);
            return;
          }
          navigation.goBack();
        },
      },
    ]);
  }

  if (loading) {
    return (
        <View style={styles.center}>
          <ActivityIndicator size="large" />
        </View>
    );
  }

  if (!habit) {
    return (
        <View style={styles.center}>
          <Text>Habitude introuvable.</Text>
        </View>
    );
  }

  return (
      <View style={styles.container}>
        <Text style={styles.title}>{habit.title}</Text>
        {habit.description ? <Text style={styles.description}>{habit.description}</Text> : null}

        <View style={styles.spacer} />

        <Pressable style={({ pressed }) => [styles.editButton, pressed && styles.editButtonPressed]} onPress={() => navigation.navigate('HabitForm', { habitId })}>
          <Text style={styles.editButtonText}>Modifier</Text>
        </Pressable>

        <View style={styles.spacer} />

        <Pressable style={({ pressed }) => [styles.deleteButton, pressed && styles.deleteButtonPressed]} onPress={handleDelete}>
          <Text style={styles.deleteButtonText}>Supprimer</Text>
        </Pressable>
      </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 26, fontWeight: '800', color: colors.text },
  description: { marginTop: 8, color: colors.textMuted, lineHeight: 21 },
  spacer: { height: 12 },
  editButton: { backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  editButtonPressed: { backgroundColor: colors.primaryPressed },
  editButtonText: { color: '#fff', fontWeight: '700' },
  deleteButton: { backgroundColor: colors.danger, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  deleteButtonPressed: { backgroundColor: colors.dangerPressed },
  deleteButtonText: { color: '#fff', fontWeight: '700' },
});
