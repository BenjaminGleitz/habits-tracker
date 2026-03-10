import { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Button,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AppStackParamList } from '../types/navigation';
import { supabase } from '../services/supabaseClient';
import {
  getHabitById,
  deleteHabit,
  markHabitDoneToday,
  isHabitDoneToday,
} from '../services/habitService';

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

        <Button
            title={doneToday ? 'Fait aujourd’hui ✅' : marking ? 'Validation...' : 'Marquer comme fait aujourd’hui'}
            onPress={handleMarkDone}
            disabled={doneToday || marking}
        />

        <View style={styles.spacer} />

        <Button
            title="Modifier"
            onPress={() => navigation.navigate('HabitForm', { habitId })}
        />

        <View style={styles.spacer} />

        <Button title="Supprimer" onPress={handleDelete} />
      </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '700' },
  description: { marginTop: 8, color: '#555' },
  spacer: { height: 12 },
});
