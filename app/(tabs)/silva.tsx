/**
 * @file Метод Сильвы — Tab screen.
 *
 * Delegates to shared SystemTabContent component.
 * INV-A3: All styles via StyleSheet.create.
 */

import { useCallback } from 'react';
import { useRouter } from 'expo-router';
import { SystemBackground } from '@/ui/components/SystemBackground';
import { SystemTabContent } from '@/ui/components/SystemTabContent';

export default function SilvaScreen() {
  const router = useRouter();
  const handlePracticePress = useCallback(
    (id: string) => router.push(`/practice/${id}` as any),
    [router],
  );

  return (
    <SystemBackground systemId="silva">
      <SystemTabContent
        systemId="silva"
        title="Метод Сильвы"
        icon="leaf-outline"
        onPracticePress={handlePracticePress}
      />
    </SystemBackground>
  );
}
