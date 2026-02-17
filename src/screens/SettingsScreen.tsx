import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import { signOut } from '../services/authService';

export default function SettingsScreen() {
  async function handleLogout() {
    const { error } = await signOut();

    if (error) {
      Alert.alert('Erreur', error.message);
    }
  }

  return (
      <View style={styles.container}>
        <Text style={styles.title}>Paramètres</Text>

        <Button title="Se déconnecter" onPress={handleLogout} />
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 20,
  },
});
