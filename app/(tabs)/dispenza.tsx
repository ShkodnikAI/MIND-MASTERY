/**
 * @file Медитации Диспензы — Tab screen.
 *
 * Delegates to shared SystemTabContent component.
 * INV-A3: All styles via StyleSheet.create.
 */

import { SystemBackground } from '@/ui/components/SystemBackground';
import { SystemTabContent } from '@/ui/components/SystemTabContent';

export default function DispenzaScreen() {
  return (
    <SystemBackground systemId="dispenza">
      <SystemTabContent systemId="dispenza" title="Медитации Диспензы" icon="sunny-outline" />
    </SystemBackground>
  );
}
