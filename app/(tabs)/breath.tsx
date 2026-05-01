/**
 * @file Дыхательные практики — Breath Tab screen.
 *
 * Delegates to shared SystemTabContent component.
 * INV-A3: All styles via StyleSheet.create.
 */

import { useRouter } from 'expo-router';
import { SystemBackground } from '@/ui/components/SystemBackground';
import { SystemTabContent } from '@/ui/components/SystemTabContent';

export default function BreathScreen() {
  const router = useRouter();

  return (
    <SystemBackground systemId="breath">
      <SystemTabContent
        systemId="breath"
        title="Дыхательные практики"
        icon="fitness-outline"
        onPracticePress={(id) => router.push(`/practice/${id}` as any)}
      />
    </SystemBackground>
  );
}
