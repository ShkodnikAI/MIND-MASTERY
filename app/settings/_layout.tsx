import { Stack } from 'expo-router';
import { Platform } from 'react-native';

export default function SettingsLayout() {
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
    >
        <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="audio" options={{ title: 'Звук' }} />
      <Stack.Screen name="music" options={{ title: 'Музыка' }} />
      <Stack.Screen name="voice" options={{ title: 'Голос' }} />
      <Stack.Screen name="light" options={{ title: 'Свет' }} />
      <Stack.Screen name="about" options={{ title: 'О приложении' }} />
      <Stack.Screen name="accessibility" options={{ title: 'Доступность' }} />
      <Stack.Screen name="backup" options={{ title: 'Резервное копирование' }} />
      <Stack.Screen name="notifications" options={{ title: 'Уведомления' }} />
    </Stack>
  );
}
