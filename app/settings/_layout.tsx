import { Stack } from 'expo-router';

export default function SettingsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTintColor: '#D4A017',
        headerBackTitle: '',
        headerStyle: { backgroundColor: '#0A0E1A' },
        headerTitleStyle: {
          fontWeight: '700',
          color: '#D4A017',
          fontSize: 17,
        },
      }}
    >
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
