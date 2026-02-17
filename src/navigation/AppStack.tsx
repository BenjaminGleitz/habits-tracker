import { Pressable } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { AppStackParamList } from '../types/navigation';

import HomeScreen from '../screens/HomeScreen';
import HabitDetailScreen from '../screens/HabitDetailScreen';
import HabitFormScreen from '../screens/HabitFormScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Stack = createNativeStackNavigator<AppStackParamList>();

export default function AppStack() {
  return (
      <Stack.Navigator>
        <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={({ navigation }) => ({
              title: 'Habits',
              headerRight: () => (
                  <Pressable onPress={() => navigation.navigate('Settings')}>
                    <Ionicons name="settings-outline" size={22} />
                  </Pressable>
              ),
            })}
        />
        <Stack.Screen name="HabitDetail" component={HabitDetailScreen} options={{ title: 'Détail' }} />
        <Stack.Screen name="HabitForm" component={HabitFormScreen} options={{ title: 'Habitude' }} />
        <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Paramètres' }} />
      </Stack.Navigator>
  );
}
