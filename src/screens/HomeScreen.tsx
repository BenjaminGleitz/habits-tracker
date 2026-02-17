import { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Button,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';

import { AppStackParamList } from '../types/navigation';
import { supabase } from '../services/supabaseClient';
import { getHabits, deleteHabit } from '../services/habitService';

type Props = NativeStackScreenProps<AppStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const [habits, setHabits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

    const { data, error } = await getHabits(session);

    if (error) {
      Alert.alert('Erreur', error.message);
    } else if (data) {
      setHabits(data);
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
        <Button
            title="Ajouter une habitude"
            onPress={() => navigation.navigate('HabitForm')}
        />

        <FlatList
            data={habits}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
                <View style={styles.card}>
                  <Button
                      title="Détail"
                      onPress={() => navigation.navigate('HabitDetail', { habitId: item.id })}
                  />
                  <Text style={styles.title}>{item.title}</Text>
                  {item.description ? (
                      <Text style={styles.description}>{item.description}</Text>
                  ) : null}

                  <Button
                      title="Supprimer"
                      onPress={() => handleDelete(item.id)}
                  />
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
  container: { flex: 1, padding: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: {
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#f3f3f3',
    marginVertical: 8,
  },
  title: { fontWeight: 'bold', fontSize: 16 },
  description: { marginTop: 4, color: '#555' },
  emptyText: { marginTop: 20, textAlign: 'center' },
});
