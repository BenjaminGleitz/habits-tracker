import { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, Pressable } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AppStackParamList } from '../types/navigation';
import { getHabitById, deleteHabit, markHabitDoneToday } from '../services/habitService';
import { scheduleHabitReminder } from '../services/reminderService';
import { supabase } from '../services/supabaseClient';
import { colors, spacing } from '../theme';

type Props = NativeStackScreenProps<AppStackParamList, 'HabitDetail'>;

const REQUEST_TIMEOUT_MS = 12000;

function withTimeout<T>(promise: Promise<T>, timeoutMs = REQUEST_TIMEOUT_MS): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error('timeout')), timeoutMs);
    }),
  ]);
}

export default function HabitDetailScreen({ route, navigation }: Props) {
  const { habitId } = route.params;

  const [loading, setLoading] = useState(true);
  const [habit, setHabit] = useState<{ id: string; title: string; description: string | null } | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [doneToday, setDoneToday] = useState(false);
  const [marking, setMarking] = useState(false);

  const loadHabit = useCallback(async () => {
    setLoading(true);
    setLoadError(null);

    try {
      if (!habitId) {
        throw new Error('missing_habit_id');
      }

      const { data, error } = await withTimeout(getHabitById(habitId));

      if (error) {
        throw new Error(error.message);
      }

      setHabit(data ?? null);
    } catch (error) {
      const message = error instanceof Error && error.message === 'timeout'
        ? "Le chargement est trop long. Vérifie ta connexion puis réessaie."
        : "Impossible de charger cette habitude. Réessaie.";

      setLoadError(message);
      setHabit(null);
    } finally {
      setLoading(false);
    }
  }, [habitId]);

  useFocusEffect(
    useCallback(() => {
      loadHabit();
    }, [loadHabit])
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
        <Text style={styles.helperText}>Chargement en cours...</Text>
      </View>
    );
  }

  if (loadError) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{loadError}</Text>
        <Pressable style={({ pressed }) => [styles.retryButton, pressed && styles.retryButtonPressed]} onPress={loadHabit}>
          <Text style={styles.retryButtonText}>Réessayer</Text>
        </Pressable>
      </View>
    );
  }

  if (!habit) {
    return (
      <View style={styles.center}>
        <Text>Habitude introuvable.</Text>
        <Pressable style={({ pressed }) => [styles.retryButton, pressed && styles.retryButtonPressed]} onPress={loadHabit}>
          <Text style={styles.retryButtonText}>Recharger</Text>
        </Pressable>
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
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.lg },
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
  helperText: { marginTop: 8, color: colors.textMuted, fontSize: 12, textAlign: 'center' },
  editButton: { backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  editButtonPressed: { backgroundColor: colors.primaryPressed },
  editButtonText: { color: '#fff', fontWeight: '700' },
  deleteButton: { backgroundColor: colors.danger, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  deleteButtonPressed: { backgroundColor: colors.dangerPressed },
  deleteButtonText: { color: '#fff', fontWeight: '700' },
  retryButton: {
    marginTop: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  retryButtonPressed: { backgroundColor: colors.primaryPressed },
  retryButtonText: { color: '#fff', fontWeight: '700' },
  errorText: { color: colors.danger, textAlign: 'center' },
});
