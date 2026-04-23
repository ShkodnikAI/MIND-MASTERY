/**
 * @file PhotosensitiveWarning — Epilepsy safety disclaimer modal.
 *
 * Displayed before any session that includes binaural beats or strobing
 * light effects. The user must tap "Понимаю" to dismiss.
 *
 * INV-A3: All styles via StyleSheet.create.
 */

import { useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
} from 'react-native';
import { colors, typography, spacing, radii } from '@/ui/theme';

interface PhotosensitiveWarningProps {
  /** Whether the modal is visible. */
  readonly visible: boolean;
  /** Callback when the user acknowledges the warning. */
  readonly onAcknowledge: () => void;
}

const DISCLAIMER_TEXT =
  'ВНИМАНИЕ\n\n' +
  'Это приложение содержит визуальные и аудио эффекты, включая пульсирующий свет ' +
  'и бинауральные ритмы.\n\n' +
  'Небольшой процент людей с эпилепсией может испытать приступ при воздействии ' +
  'определённых визуальных стимулов, таких как вспышки света или узоры.\n\n' +
  'Если вы или кто-то из вашей семьи страдаете эпилепсией или имеете судорожные ' +
  'расстройства, пожалуйста, проконсультируйтесь с врачом перед использованием ' +
  'этих функций.\n\n' +
  'Немедленно прекратите использование и обратитесь к врачу, если вы испытаете ' +
  'головокружение, тошноту, помутнение зрения или любой дискомфорт.';

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    backgroundColor: colors.background.elevated,
    borderRadius: radii.xl,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 400,
  },
  warningIcon: {
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  titleText: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.sizes.xl,
    lineHeight: typography.lineHeights.xl,
    color: colors.accent.warning,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  disclaimerText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.md,
    color: colors.text.secondary,
    marginBottom: spacing.xl,
  },
  acknowledgeButton: {
    backgroundColor: colors.accent.warning,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
  },
  acknowledgeButtonText: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.sizes.md,
    lineHeight: typography.lineHeights.md,
    color: colors.text.inverse,
  },
});

export function PhotosensitiveWarning({
  visible,
  onAcknowledge,
}: PhotosensitiveWarningProps) {
  const handleAcknowledge = useCallback(() => {
    onAcknowledge();
  }, [onAcknowledge]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <Text style={styles.titleText}>⚠️ Предупреждение</Text>
          <Text style={styles.disclaimerText}>{DISCLAIMER_TEXT}</Text>
          <TouchableOpacity
            style={styles.acknowledgeButton}
            onPress={handleAcknowledge}
            activeOpacity={0.8}
            accessibilityLabel="Понимаю"
            accessibilityRole="button"
          >
            <Text style={styles.acknowledgeButtonText}>Понимаю</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
