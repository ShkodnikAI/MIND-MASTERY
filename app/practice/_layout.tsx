import { Stack } from 'expo-router';

export default function PracticeLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTintColor: '#D4A017',
        headerBackTitle: '',
        headerBackTitleStyle: { color: '#D4A017' },
        headerStyle: { backgroundColor: '#0A0E1A' },
        headerTitleStyle: {
          fontWeight: '700',
          color: '#D4A017',
          fontSize: 17,
        },
      }}
    />
  );
}
