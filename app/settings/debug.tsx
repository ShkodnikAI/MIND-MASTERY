/**
 * @file Debug Screen — Test crash logging and GitHub issue reporting.
 *
 * TEMPORARY — will be removed before release.
 */

import React, { useCallback, useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, radii } from '@/ui/theme';
import {
  getLogCount,
  clearLogs,
  exportLogs,
  addInfoLog,
} from '@/utils/crashLogger';
import { reportToGitHub } from '@/utils/githubReporter';

// ─── Styles ───────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1 },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  headerText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.sizes.xxl,
    lineHeight: typography.lineHeights.xxl,
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },
  card: {
    backgroundColor: colors.background.tertiary,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  cardTitle: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.sizes.md,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  cardValue: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
  },
  testButton: {
    backgroundColor: '#E74C3C',
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  testButtonText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.sizes.md,
    color: '#FFFFFF',
  },
  sendButton: {
    backgroundColor: colors.accent.primary,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  sendButtonText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.sizes.md,
    color: colors.text.primary,
  },
  clearButton: {
    backgroundColor: colors.background.elevated,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  clearButtonText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
  },
  logPreview: {
    backgroundColor: colors.background.secondary,
    borderRadius: radii.sm,
    padding: spacing.sm,
    marginTop: spacing.sm,
    maxHeight: 200,
  },
  logText: {
    fontSize: 11,
    color: colors.text.tertiary,
  },
  warningText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.sizes.sm,
    color: '#FDCB6E',
    marginTop: spacing.md,
    textAlign: 'center',
  },
});

// ─── Component ────────────────────────────────────────────────────

export default function DebugScreen() {
  const [logCount, setLogCount] = useState(0);
  const [sending, setSending] = useState(false);
  const [lastResult, setLastResult] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => setLogCount(getLogCount()), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleTestCrash = useCallback(() => {
    addInfoLog('TEST: Manual crash triggered by developer', 'DebugScreen');
    try {
      throw new Error(
        'TEST CRASH — это тестовая ошибка для проверки CrashLogger',
      );
    } catch (e: any) {
      console.error('[TEST]', 'Crash test triggered', e);
    }
    Alert.alert(
      'Тестовый краш',
      'Ошибка сгенерирована и записана в лог. Проверьте количество логов.',
    );
    setLogCount(getLogCount());
  }, []);

  const handleSendLogs = useCallback(async () => {
    if (logCount === 0) {
      Alert.alert('Нет логов', 'Логи пусты — сначала воспроизведите ошибку.');
      return;
    }
    setSending(true);
    setLastResult(null);
    const result = await reportToGitHub(
      `Crash report — ${new Date().toISOString().slice(0, 10)}`,
      'Автоматический отчёт об ошибке из MIND MASTERY',
    );
    setSending(false);
    if (result.success) {
      setLastResult(`Issue создан: ${result.url}`);
      Alert.alert('Отправлено', `Issue создан успешно!\n${result.url}`);
    } else {
      setLastResult(`Ошибка: ${result.error}`);
      Alert.alert('Ошибка отправки', result.error);
    }
  }, [logCount]);

  const handleClearLogs = useCallback(() => {
    clearLogs();
    setLogCount(0);
    setLastResult(null);
    Alert.alert('Логи очищены', 'Все записанные логи удалены.');
  }, []);

  const previewText =
    logCount > 0 ? exportLogs().slice(-500) : 'Логов нет';

  return (
    <LinearGradient
      colors={[colors.background.primary, colors.background.secondary]}
      style={styles.gradient}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.headerText}>Отладка (TEST)</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Захвачено логов</Text>
          <Text style={styles.cardValue}>{logCount} записей</Text>
        </View>

        <Text style={styles.warningText}>
          ⚠ Временная кнопка для тестирования. Будет удалена перед релизом.
        </Text>

        <TouchableOpacity style={styles.testButton} onPress={handleTestCrash}>
          <Text style={styles.testButtonText}>TEST — Сгенерировать краш</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.sendButton}
          onPress={handleSendLogs}
          disabled={sending}
        >
          {sending ? (
            <ActivityIndicator color={colors.text.primary} />
          ) : (
            <Text style={styles.sendButtonText}>
              Отправить логи в GitHub
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.clearButton} onPress={handleClearLogs}>
          <Text style={styles.clearButtonText}>Очистить логи</Text>
        </TouchableOpacity>

        {lastResult && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Результат</Text>
            <Text style={styles.cardValue}>{lastResult}</Text>
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Последние логи</Text>
          <View style={styles.logPreview}>
            <Text style={styles.logText} selectable numberOfLines={20}>
              {previewText}
            </Text>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}
