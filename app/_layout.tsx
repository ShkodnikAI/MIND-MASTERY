import { Slot } from 'expo-router';
import { Text, View } from 'react-native';

export default function RootLayout() {
  return (
    <View style={{flex: 1, backgroundColor: '#0A0E1A', alignItems: 'center', justifyContent: 'center'}}>
      <Text style={{color: '#00ff00', fontSize: 28, fontWeight: 'bold'}}>MIND MASTERY</Text>
      <Text style={{color: '#ffffff', fontSize: 14}}>v1.0 test</Text>
      <Slot />
    </View>
  );
}

