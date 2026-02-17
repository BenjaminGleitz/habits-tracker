import { View, Text, Button, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<AppStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  return (
      <View style={styles.container}>
        <Text style={styles.title}>Home Screen</Text>

        <Button
            title="Aller à Settings"
            onPress={() => navigation.navigate('Settings')}
        />

        <View style={styles.spacer} />

        <Button
            title="Ajouter une habitude"
            onPress={() => navigation.navigate('HabitForm')}
        />

        <View style={styles.spacer} />

        <Button
            title="Voir détail (demo)"
            onPress={() =>
                navigation.navigate('HabitDetail', { habitId: 'demo-1' })
            }
        />
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 20,
  },
  spacer: {
    height: 12,
  },
});
