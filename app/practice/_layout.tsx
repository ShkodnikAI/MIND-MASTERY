import { Stack } from 'expo-router';
import { Platform } from 'react-native';

export default function PracticeLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTintColor: '#D4A017',
        headerBackTitle: '',
        headerBackTitleStyle: { fontSize: 0 },
        headerStyle: { backgroundColor: '#0A0E1A' },
        headerTitleStyle: {
          fontWeight: '700',
          color: '#D4A017',
          fontSize: Platform.select({ ios: 17, android: 20 }),
        },
        headerShadowVisible: false,
      }}
    />
  );
}
