import { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Button, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AppStackParamList } from '../types/navigation';
import { getHabitById, deleteHabit } from '../services/habitService';

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
