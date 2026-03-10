import { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, Pressable } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AppStackParamList } from '../types/navigation';
import { getHabitById, deleteHabit } from '../services/habitService';
import { scheduleHabitReminder } from '../services/reminderService';
import { colors, spacing } from '../theme';

type Props = NativeStackScreenProps<AppStackParamList, 'HabitDetail'>;

export default function HabitDetailScreen({ route, navigation }: Props) {
  const { habitId } = route.params;

  const [loading, setLoading] = useState(true);
  const [habit, setHabit] = useState<{
    id: string;
    title: string;
    description: string | null;
  } | null>(null);

  const [doneToday, setDoneToday] = useState(false);
  const [marking, setMarking] = useState(false);

  const loadHabitAndStatus = useCallback(async () => {
    setLoading(true);

    // 1) charge l'habitude
    const { data, error } = await getHabitById(habitId);

    if (error) {
      Alert.alert('Erreur', error.message);
      setHabit(null);
      setLoading(false);
      return;
    }

    setHabit(data ? { id: data.id, title: data.title, description: data.description } : null);

    // 2) charge l'état "fait aujourd'hui"
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    const session = sessionData.session;

    if (!sessionError && session) {
      const { done, error: doneError } = await isHabitDoneToday(session.user.id, habitId);
      if (doneError && doneError.code !== 'PGRST116') {
        // PGRST116 = "No rows found" (pas de log pour aujourd'hui) -> pas une vraie erreur pour nous
        Alert.alert('Erreur', doneError.message);
      }
      setDoneToday(done);
    } else {
      setDoneToday(false);
    }

    setLoading(false);
  }, [habitId]);

  useFocusEffect(
      useCallback(() => {
        loadHabitAndStatus();
      }, [loadHabitAndStatus])
  );

  async function handleMarkDone() {
    setMarking(true);

    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    const session = sessionData.session;

    if (sessionError || !session) {
      setMarking(false);
      Alert.alert('Erreur', 'Session invalide. Reconnecte-toi.');
      return;
    }

    const { error } = await markHabitDoneToday(session.user.id, habitId);

    setMarking(false);

    if (error) {
      Alert.alert('Erreur', error.message);
      return;
    }

    setDoneToday(true);
  }

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

  async function handleScheduleReminder() {
    if (!habit?.title) {
      return;
    }

    Alert.alert(
      'Activer un rappel',
      "On va te demander la permission de notifications (Android 13+) pour te rappeler cette habitude.",
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Continuer',
          onPress: async () => {
            const result = await scheduleHabitReminder(habit.title, 10);

            if (!result.ok) {
              Alert.alert('Permission refusée', 'Tu as refusé la permission notifications. Le rappel n\'a pas été programmé.');
              return;
            }

            Alert.alert('Rappel créé', 'Un rappel local sera déclenché dans 10 secondes.');
          },
        },
      ]
    );
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

        <Pressable style={({ pressed }) => [styles.reminderButton, pressed && styles.reminderButtonPressed]} onPress={handleScheduleReminder}>
          <Text style={styles.reminderButtonText}>Rappel local (10s)</Text>
        </Pressable>

        <Text style={styles.helperText}>En cas de refus de permission, le rappel n'est pas créé.</Text>

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
  reminderButton: {
    backgroundColor: '#0E7490',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  reminderButtonPressed: { backgroundColor: '#155E75' },
  reminderButtonText: { color: '#fff', fontWeight: '700' },
  helperText: { marginTop: 8, color: colors.textMuted, fontSize: 12 },
  editButton: { backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  editButtonPressed: { backgroundColor: colors.primaryPressed },
  editButtonText: { color: '#fff', fontWeight: '700' },
  deleteButton: { backgroundColor: colors.danger, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  deleteButtonPressed: { backgroundColor: colors.dangerPressed },
  deleteButtonText: { color: '#fff', fontWeight: '700' },
});
