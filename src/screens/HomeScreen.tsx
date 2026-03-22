import { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Pressable,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';

import { AppStackParamList } from '../types/navigation';
import { supabase } from '../services/supabaseClient';
import { getHabits, deleteHabit } from '../services/habitService';
import type { Habit } from '../types/habit';
import { colors, spacing } from '../theme';

type Props = NativeStackScreenProps<AppStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);

  function getCacheKey(userId: string) {
    return `habits_cache_${userId}`;
  }

  useFocusEffect(
      useCallback(() => {
        loadHabits();
      }, [])
  );

  async function loadHabits() {
    setLoading(true);

    const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();

    const session = sessionData.session;

    if (sessionError || !session) {
      setLoading(false);
      return;
    }

    const cacheKey = getCacheKey(session.user.id);
    let hasCache = false;

    try {
      const cachedHabitsRaw = await AsyncStorage.getItem(cacheKey);
      if (cachedHabitsRaw) {
        const cachedHabits = JSON.parse(cachedHabitsRaw) as Habit[];
        setHabits(cachedHabits);
        hasCache = true;
      }
    } catch {
    }

    const { data, error } = await getHabits(session);

    if (error) {
      if (hasCache) {
        Alert.alert('Mode hors ligne', 'Connexion indisponible : affichage des dernières habitudes enregistrées localement.');
      } else {
        Alert.alert('Erreur', error.message);
      }
    } else if (data) {
      setHabits(data);
      try {
        await AsyncStorage.setItem(cacheKey, JSON.stringify(data));
      } catch {
      }
    }

    setLoading(false);
  }

  async function handleDelete(id: string) {
    const { error } = await deleteHabit(id);

    if (error) {
      Alert.alert('Erreur', error.message);
      return;
    }

    loadHabits();
  }

  if (loading) {
    return (
        <View style={styles.center}>
          <ActivityIndicator size="large" />
        </View>
    );
  }

  return (
      <View style={styles.container}>
        <Pressable
            style={({ pressed }) => [styles.addButton, pressed && styles.addButtonPressed]}
            onPress={() => navigation.navigate('HabitForm')}
        >
          <Text style={styles.addButtonText}>+ Ajouter une habitude</Text>
        </Pressable>

        <FlatList
            data={habits}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
                <View style={styles.card}>
                  <Text style={styles.title}>{item.title}</Text>
                  {item.description ? (
                      <Text style={styles.description}>{item.description}</Text>
                  ) : null}

                  <View style={styles.rowActions}>
                    <Pressable
                        style={({ pressed }) => [styles.detailButton, pressed && styles.detailButtonPressed]}
                        onPress={() => navigation.navigate('HabitDetail', { habitId: item.id })}
                    >
                      <Text style={styles.detailButtonText}>Détail</Text>
                    </Pressable>

                    <Pressable
                        style={({ pressed }) => [styles.deleteButton, pressed && styles.deleteButtonPressed]}
                        onPress={() => handleDelete(item.id)}
                    >
                      <Text style={styles.deleteButtonText}>Supprimer</Text>
                    </Pressable>
                  </View>
                </View>
            )}
            ListEmptyComponent={
              <Text style={styles.emptyText}>Aucune habitude</Text>
            }
        />
      </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  addButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  addButtonPressed: { backgroundColor: colors.primaryPressed },
  addButtonText: { color: '#fff', fontWeight: '700' },
  card: {
    padding: 15,
    borderRadius: 14,
    backgroundColor: colors.surface,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: { fontWeight: '700', fontSize: 17, color: colors.text },
  description: { marginTop: 4, color: colors.textMuted },
  rowActions: { flexDirection: 'row', gap: spacing.xs, marginTop: spacing.md },
  detailButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  detailButtonPressed: { backgroundColor: '#F9FAFB' },
  detailButtonText: { fontWeight: '600', color: colors.text },
  deleteButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: colors.danger,
    alignItems: 'center',
  },
  deleteButtonPressed: { backgroundColor: colors.dangerPressed },
  deleteButtonText: { color: '#fff', fontWeight: '600' },
  emptyText: { marginTop: 20, textAlign: 'center', color: colors.textMuted },
});
