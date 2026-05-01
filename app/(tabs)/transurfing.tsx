/**
 * @file Трансерфинг Реальности — Tab screen.
 *
 * Delegates to shared SystemTabContent component.
 * INV-A3: All styles via StyleSheet.create.
 */

import { useRouter } from 'expo-router';
import { SystemBackground } from '@/ui/components/SystemBackground';
import { SystemTabContent } from '@/ui/components/SystemTabContent';

export default function TransurfingScreen() {
  const router = useRouter();

  return (
    <SystemBackground systemId="transurfing">
      <SystemTabContent
        systemId="transurfing"
        title="Трансерфинг Реальности"
        icon="sparkles-outline"
        onPracticePress={(id) => router.push(`/practice/${id}` as any)}
      />
    </SystemBackground>
  );
}
