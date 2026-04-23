/**
 * @file Метод Сильвы — Tab screen.
 *
 * Delegates to shared SystemTabContent component.
 * INV-A3: All styles via StyleSheet.create.
 */

import { SystemBackground } from '@/ui/components/SystemBackground';
import { SystemTabContent } from '@/ui/components/SystemTabContent';

export default function SilvaScreen() {
  return (
    <SystemBackground systemId="silva">
      <SystemTabContent systemId="silva" title="Метод Сильвы" icon="leaf-outline" />
    </SystemBackground>
  );
}
