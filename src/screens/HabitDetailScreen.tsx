import { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, Pressable } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AppStackParamList } from '../types/navigation';
import { getHabitById, deleteHabit, markHabitDoneToday } from '../services/habitService';
import { scheduleHabitReminder } from '../services/reminderService';
import { supabase } from '../services/supabaseClient';
import { colors, elevation, radii, spacing } from '../theme';

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
        ? 'Le chargement est trop long. Vérifie ta connexion puis réessaie.'
        : 'Impossible de charger cette habitude. Réessaie.';

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
      'On va te demander la permission de notifications pour te rappeler cette habitude.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Continuer',
          onPress: async () => {
            const result = await scheduleHabitReminder(habit.title, 10);

            if (!result.ok) {
              Alert.alert('Permission refusée', "Tu as refusé la permission notifications. Le rappel local n'a pas été programmé.");
              return;
            }

            Alert.alert('Rappel créé', 'Une notification locale sera envoyée dans 10 secondes.');
          },
        },
      ]
    );
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
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
        <Text style={styles.helperText}>Habitude introuvable.</Text>
        <Pressable style={({ pressed }) => [styles.retryButton, pressed && styles.retryButtonPressed]} onPress={loadHabit}>
          <Text style={styles.retryButtonText}>Recharger</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>{habit.title}</Text>
        {habit.description ? <Text style={styles.description}>{habit.description}</Text> : null}

        <Pressable style={({ pressed }) => [styles.accentButton, pressed && styles.accentButtonPressed]} onPress={handleScheduleReminder}>
          <Text style={styles.buttonText}>Rappel local (10s)</Text>
        </Pressable>

        <Pressable style={({ pressed }) => [styles.doneButton, pressed && styles.doneButtonPressed]} onPress={handleMarkDone}>
          {marking ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{doneToday ? 'Déjà validée aujourd’hui' : 'Marquer comme faite aujourd’hui'}</Text>}
        </Pressable>

        <Pressable style={({ pressed }) => [styles.editButton, pressed && styles.editButtonPressed]} onPress={() => navigation.navigate('HabitForm', { habitId })}>
          <Text style={styles.buttonText}>Modifier</Text>
        </Pressable>

        <Pressable style={({ pressed }) => [styles.deleteButton, pressed && styles.deleteButtonPressed]} onPress={handleDelete}>
          <Text style={styles.buttonText}>Supprimer</Text>
        </Pressable>

        <Text style={styles.helperText}>En cas de refus de permission, le rappel n'est pas créé.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg, backgroundColor: colors.background },
  card: {
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceStrong,
    padding: spacing.lg,
    gap: spacing.sm,
    ...elevation.card,
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.lg },
  title: { fontSize: 26, fontWeight: '800', color: colors.text },
  description: { marginBottom: spacing.sm, color: colors.textMuted, lineHeight: 21 },
  accentButton: {
    backgroundColor: colors.accent,
    borderRadius: radii.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  accentButtonPressed: { backgroundColor: colors.accentPressed },
  doneButton: {
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  doneButtonPressed: { backgroundColor: colors.primaryPressed },
  editButton: { backgroundColor: colors.primary, borderRadius: radii.md, paddingVertical: 14, alignItems: 'center' },
  editButtonPressed: { backgroundColor: colors.primaryPressed },
  deleteButton: { backgroundColor: colors.danger, borderRadius: radii.md, paddingVertical: 14, alignItems: 'center' },
  deleteButtonPressed: { backgroundColor: colors.dangerPressed },
  buttonText: { color: '#fff', fontWeight: '700' },
  helperText: { marginTop: 8, color: colors.textMuted, fontSize: 12, textAlign: 'center' },
  retryButton: {
    marginTop: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  retryButtonPressed: { backgroundColor: colors.primaryPressed },
  retryButtonText: { color: '#fff', fontWeight: '700' },
  errorText: { color: colors.danger, textAlign: 'center' },
});
