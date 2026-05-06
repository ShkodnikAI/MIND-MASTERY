import { Stack } from 'expo-router';
import { Platform } from 'react-native';

export default function PracticeLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}
