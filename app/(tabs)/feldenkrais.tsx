/**
 * @file Осознание через движение — Фельденкрайз Tab screen.
 *
 * Delegates to shared SystemTabContent component.
 * INV-A3: All styles via StyleSheet.create.
 */

import { useRouter } from 'expo-router';
import { SystemBackground } from '@/ui/components/SystemBackground';
import { SystemTabContent } from '@/ui/components/SystemTabContent';

export default function FeldenkraisScreen() {
  const router = useRouter();

  return (
    <SystemBackground systemId="feldenkrais">
      <SystemTabContent
        systemId="feldenkrais"
        title="Осознание через движение"
        icon="body-outline"
        onPracticePress={(id) => router.push(`/practice/${id}` as any)}
      />
    </SystemBackground>
  );
}
