/**
 * @file Проекция доминантной частоты — DFP Tab screen.
 *
 * Delegates to shared SystemTabContent component.
 * On first mount, auto-creates persistent reminders (every 2h, 08:00–20:00).
 * INV-A3: All styles via StyleSheet.create.
 */

import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { SystemBackground } from '@/ui/components/SystemBackground';
import { SystemTabContent } from '@/ui/components/SystemTabContent';
import { ensureDomfreqReminders } from '@/services/domfreq/domfreqReminders';
import { logger } from '@/utils/logger';

export default function DomfreqScreen() {
  const router = useRouter();

  useEffect(() => {
    // Auto-create persistent DFP reminders on first visit
    ensureDomfreqReminders().then((count) => {
      if (count > 0) {
        logger.info('[domfreq]', `Auto-created ${count} persistent reminders`);
      }
    });
  }, []);

  return (
    <SystemBackground systemId="domfreq">
      <SystemTabContent
        systemId="domfreq"
        title="Проекция доминантной частоты"
        icon="radio-outline"
        onPracticePress={(id) => router.push(`/practice/${id}` as any)}
      />
    </SystemBackground>
  );
}
