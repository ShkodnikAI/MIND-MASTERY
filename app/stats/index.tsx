/**
 * @file Statistics / Progress Screen.
 *
 * Route: /stats
 *
 * Displays:
 *  1. Overview cards — total sessions, practice time, current & longest streaks.
 *  2. System breakdown — per-system progress with progress bars.
 *  3. Weekly activity — 7-day dot grid.
 *  4. Recent sessions — last 5 completed sessions from the database.
 *
 * INV-A3: All styles via StyleSheet.create.
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { colors, typography, spacing, radii } from '@/ui/theme';
import { useProgressStore } from '@/store/progressStore';
import { useContentStore } from '@/store/contentStore';
import { getTotalSessionMinutes, getRecentSessions } from '@/db/queries/sessions';
import type { SessionRecord as DbSessionRecord } from '@/db/types';

// ─── Types ────────────────────────────────────────────────────────

interface SystemStat {
  id: string;
  name: string;
  icon: string;
  color: string;
  totalPractices: number;
  completedPractices: number;
}

interface RecentSession {
  id: string;
  practiceName: string;
  durationMin: number;
  date: Date;
  systemId: string;
}

interface WeekDay {
  label: string;
  date: Date;
  hasActivity: boolean;
  isToday: boolean;
}

// ─── Constants ────────────────────────────────────────────────────

const SYSTEM_IDS = ['transurfing', 'silva', 'dispenza', 'feldenkrais', 'breath'] as const;

const WEEKDAY_LABELS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

// ─── Helpers ──────────────────────────────────────────────────────

/** Extract YYYY-MM-DD from an ISO date string. */
function getDayKey(isoString: string): string {
  return isoString.slice(0, 10);
}

/** Get Monday of the current week. */
function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

/** Format minutes into human-readable string. */
function formatMinutes(min: number): string {
  if (min < 1) return '0 мин';
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  if (h === 0) return `${m} мин`;
  if (m === 0) return `${h} ч`;
  return `${h} ч ${m} мин`;
}

/** Format a date into a short Russian string. */
function formatDate(d: Date): string {
  const now = new Date();
  const todayKey = getDayKey(now.toISOString());
  const dateKey = getDayKey(d.toISOString());
  const yesterdayKey = getDayKey(new Date(now.getTime() - 86400000).toISOString());

  if (dateKey === todayKey) return 'Сегодня';
  if (dateKey === yesterdayKey) return 'Вчера';

  const months = [
    'янв',
    'фев',
    'мар',
    'апр',
    'мая',
    'июн',
    'июл',
    'авг',
    'сен',
    'окт',
    'ноя',
    'дек',
  ];
  return `${d.getDate()} ${months[d.getMonth()]}`;
}

/** Compute current streak and longest streak from a set of ISO date strings. */
function computeStreaks(dates: string[]): { current: number; longest: number } {
  if (dates.length === 0) return { current: 0, longest: 0 };

  const daySet = new Set(dates.filter(Boolean).map((d) => getDayKey(d)));
  if (daySet.size === 0) return { current: 0, longest: 0 };

  // ── Current streak (newest → oldest, must start today or yesterday) ──
  const uniqueDesc = Array.from(daySet).sort().reverse();
  const todayKey = getDayKey(new Date().toISOString());
  const yesterdayKey = getDayKey(new Date(Date.now() - 86400000).toISOString());

  let current = 0;
  if (uniqueDesc[0] === todayKey || uniqueDesc[0] === yesterdayKey) {
    current = 1;
    for (let i = 1; i < uniqueDesc.length; i++) {
      const prev = new Date(uniqueDesc[i - 1]);
      const curr = new Date(uniqueDesc[i]);
      const diffDays = Math.round((prev.getTime() - curr.getTime()) / 86400000);
      if (diffDays === 1) {
        current++;
      } else {
        break;
      }
    }
  }

  // ── Longest streak (scan all unique days ascending) ──
  const uniqueAsc = Array.from(daySet).sort();
  let longest = 1;
  let run = 1;
  for (let i = 1; i < uniqueAsc.length; i++) {
    const prev = new Date(uniqueAsc[i - 1]);
    const curr = new Date(uniqueAsc[i]);
    const diffDays = Math.round((curr.getTime() - prev.getTime()) / 86400000);
    if (diffDays === 1) {
      run++;
      if (run > longest) longest = run;
    } else {
      run = 1;
    }
  }

  return { current, longest };
}

// ─── Styles ──────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxxl,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: radii.sm,
    backgroundColor: colors.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.sizes.xxl,
    lineHeight: typography.lineHeights.xxl,
    color: colors.text.primary,
    flex: 1,
  },
  sectionTitle: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.sizes.md,
    lineHeight: typography.lineHeights.md,
    color: colors.text.primary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },

  // ── Overview cards ──────────────────────────────────────────────
  overviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  overviewCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.background.tertiary,
    borderRadius: radii.md,
    padding: spacing.md,
    alignItems: 'center',
    minHeight: 100,
  },
  overviewIcon: {
    width: 36,
    height: 36,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  overviewValue: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.sizes.xxl,
    lineHeight: typography.lineHeights.xxl,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  overviewLabel: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.xs,
    lineHeight: typography.lineHeights.xs,
    color: colors.text.tertiary,
    textAlign: 'center',
  },

  // ── System breakdown ────────────────────────────────────────────
  systemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.tertiary,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  systemIconWrap: {
    width: 40,
    height: 40,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  systemInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  systemName: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.sizes.md,
    lineHeight: typography.lineHeights.md,
    color: colors.text.primary,
  },
  systemSubtext: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.sm,
    color: colors.text.tertiary,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: colors.background.elevated,
    borderRadius: radii.full,
    overflow: 'hidden',
    marginTop: spacing.xs,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: radii.full,
  },
  systemCount: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.sizes.md,
    lineHeight: typography.lineHeights.md,
    color: colors.text.primary,
    minWidth: 40,
    textAlign: 'right',
  },

  // ── Weekly activity ─────────────────────────────────────────────
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.background.tertiary,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  weekDayColumn: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.sm,
  },
  weekDayLabel: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.xs,
    lineHeight: typography.lineHeights.xs,
    color: colors.text.tertiary,
  },
  weekDayLabelToday: {
    color: colors.text.primary,
    fontFamily: typography.fontFamily.semibold,
  },
  weekDot: {
    width: 10,
    height: 10,
    borderRadius: radii.full,
    backgroundColor: colors.background.elevated,
  },
  weekDotActive: {
    backgroundColor: colors.accent.primary,
  },
  weekDotToday: {
    borderWidth: 2,
    borderColor: colors.text.primary,
  },

  // ── Recent sessions ─────────────────────────────────────────────
  sessionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.tertiary,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  sessionIconWrap: {
    width: 40,
    height: 40,
    borderRadius: radii.sm,
    backgroundColor: colors.background.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sessionInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  sessionName: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.sizes.md,
    lineHeight: typography.lineHeights.md,
    color: colors.text.primary,
  },
  sessionMeta: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.sm,
    color: colors.text.tertiary,
  },
  sessionDuration: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.sm,
    color: colors.accent.secondary,
  },

  // ── Loading / empty ─────────────────────────────────────────────
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
  emptyText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.sm,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});

// ─── Component ────────────────────────────────────────────────────

export default function StatsScreen() {
  const router = useRouter();

  // ── Stores ──────────────────────────────────────────────────────
  const practices = useProgressStore((s) => s.practices);
  const systemIndex = useProgressStore((s) => s.systemIndex);
  const contentSystems = useContentStore((s) => s.systems);
  const allPractices = useContentStore((s) => s.practices);
  const getPractice = useContentStore((s) => s.getPractice);

  // ── State ───────────────────────────────────────────────────────
  const [totalMinutes, setTotalMinutes] = useState<number>(0);
  const [recentSessions, setRecentSessions] = useState<RecentSession[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // ── Data loading ────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        const [minutes, sessions] = await Promise.all([
          getTotalSessionMinutes(),
          getRecentSessions(5),
        ]);

        if (cancelled) return;

        setTotalMinutes(Math.round(minutes));
        setRecentSessions(
          sessions
            .filter((s) => s.completed === 1)
            .map((s: DbSessionRecord) => ({
              id: s.id,
              practiceName: getPractice(s.practice_id)?.title ?? 'Неизвестная практика',
              durationMin: s.duration_ms ? Math.round(s.duration_ms / 60000) : 0,
              date: new Date(s.created_at),
              systemId: s.system_id,
            })),
        );
      } catch {
        // Silently fail — show zeros
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadData();
    return () => {
      cancelled = true;
    };
  }, [getPractice]);

  // ── Computed: total sessions completed ──────────────────────────
  const totalSessions = useMemo(() => {
    return Object.values(practices).reduce((sum, p) => sum + p.completedCount, 0);
  }, [practices]);

  // ── Computed: streaks ───────────────────────────────────────────
  const { currentStreak, longestStreak } = useMemo(() => {
    const dates = Object.values(practices)
      .map((p) => p.lastCompletedAt)
      .filter((d): d is string => d !== null);
    const streaks = computeStreaks(dates);
    return { currentStreak: streaks.current, longestStreak: streaks.longest };
  }, [practices]);

  // ── Computed: system breakdown ──────────────────────────────────
  const systemStats: SystemStat[] = useMemo(() => {
    return SYSTEM_IDS.map((id) => {
      const meta = contentSystems[id];
      const practiceIds = systemIndex[id] ?? [];
      const totalInSystem = Object.values(allPractices).filter((p) => p.systemId === id).length;
      const completedInSystem = practiceIds.filter(
        (pid) => practices[pid]?.completedCount > 0,
      ).length;

      return {
        id,
        name: meta?.name ?? id,
        icon: meta?.icon ?? 'circle-outline',
        color: meta?.color ?? colors.accent.primary,
        totalPractices: totalInSystem,
        completedPractices: completedInSystem,
      };
    });
  }, [contentSystems, systemIndex, practices, allPractices]);

  // ── Computed: weekly activity ───────────────────────────────────
  const weekDays: WeekDay[] = useMemo(() => {
    const monday = getMonday(new Date());
    const todayKey = getDayKey(new Date().toISOString());

    // Collect all day keys where any practice was last completed
    const activeDays = new Set(
      Object.values(practices)
        .map((p) => p.lastCompletedAt)
        .filter((d): d is string => d !== null)
        .map((d) => getDayKey(d)),
    );

    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(monday);
      date.setDate(date.getDate() + i);
      const dayKey = getDayKey(date.toISOString());
      return {
        label: WEEKDAY_LABELS[i],
        date,
        hasActivity: activeDays.has(dayKey),
        isToday: dayKey === todayKey,
      };
    });
  }, [practices]);

  // ── Navigation ──────────────────────────────────────────────────
  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  // ── Render ──────────────────────────────────────────────────────
  return (
    <LinearGradient
      colors={[colors.background.primary, colors.background.secondary]}
      style={styles.gradient}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Header ─────────────────────────────────────────── */}
          <View style={styles.headerRow}>
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <Ionicons name="arrow-back" size={22} color={colors.text.secondary} />
            </TouchableOpacity>
            <Text style={styles.titleText}>Статистика</Text>
          </View>

          {/* ── Overview Cards ──────────────────────────────────── */}
          <Text style={styles.sectionTitle}>Обзор</Text>
          <View style={styles.overviewGrid}>
            {/* Total Sessions */}
            <View style={styles.overviewCard}>
              <View
                style={[styles.overviewIcon, { backgroundColor: `${colors.accent.primary}22` }]}
              >
                <Ionicons name="checkmark-done" size={20} color={colors.accent.primary} />
              </View>
              <Text style={styles.overviewValue}>{loading ? '—' : totalSessions}</Text>
              <Text style={styles.overviewLabel}>Сессий завершено</Text>
            </View>

            {/* Total Time */}
            <View style={styles.overviewCard}>
              <View
                style={[styles.overviewIcon, { backgroundColor: `${colors.accent.success}22` }]}
              >
                <Ionicons name="time" size={20} color={colors.accent.success} />
              </View>
              <Text style={styles.overviewValue}>
                {loading ? '—' : formatMinutes(totalMinutes)}
              </Text>
              <Text style={styles.overviewLabel}>Время практики</Text>
            </View>

            {/* Current Streak */}
            <View style={styles.overviewCard}>
              <View
                style={[styles.overviewIcon, { backgroundColor: `${colors.accent.warning}22` }]}
              >
                <Ionicons name="flame" size={20} color={colors.accent.warning} />
              </View>
              <Text style={styles.overviewValue}>{currentStreak}</Text>
              <Text style={styles.overviewLabel}>Текущая серия, дн.</Text>
            </View>

            {/* Longest Streak */}
            <View style={styles.overviewCard}>
              <View style={[styles.overviewIcon, { backgroundColor: `${colors.accent.error}22` }]}>
                <Ionicons name="trophy" size={20} color={colors.accent.error} />
              </View>
              <Text style={styles.overviewValue}>{longestStreak}</Text>
              <Text style={styles.overviewLabel}>Макс. серия, дн.</Text>
            </View>
          </View>

          {/* ── System Breakdown ────────────────────────────────── */}
          <Text style={styles.sectionTitle}>Прогресс по системам</Text>
          {systemStats.map((system) => {
            const progress =
              system.totalPractices > 0
                ? Math.round((system.completedPractices / system.totalPractices) * 100)
                : 0;

            return (
              <View key={system.id} style={styles.systemCard}>
                <View style={[styles.systemIconWrap, { backgroundColor: `${system.color}22` }]}>
                  <Ionicons name={system.icon as any} size={20} color={system.color} />
                </View>
                <View style={styles.systemInfo}>
                  <Text style={styles.systemName}>{system.name}</Text>
                  <Text style={styles.systemSubtext}>
                    {system.completedPractices}/{system.totalPractices} практик пройдено
                  </Text>
                  <View style={styles.progressBarBg}>
                    <View
                      style={[
                        styles.progressBarFill,
                        {
                          width: `${progress}%`,
                          backgroundColor: system.color,
                        },
                      ]}
                    />
                  </View>
                </View>
                <Text style={styles.systemCount}>{progress}%</Text>
              </View>
            );
          })}

          {/* ── Weekly Activity ─────────────────────────────────── */}
          <Text style={styles.sectionTitle}>Активность за неделю</Text>
          <View style={styles.weekRow}>
            {weekDays.map((day) => (
              <View key={day.label} style={styles.weekDayColumn}>
                <Text style={[styles.weekDayLabel, day.isToday && styles.weekDayLabelToday]}>
                  {day.label}
                </Text>
                <View
                  style={[
                    styles.weekDot,
                    day.hasActivity && styles.weekDotActive,
                    day.isToday && styles.weekDotToday,
                  ]}
                />
              </View>
            ))}
          </View>

          {/* ── Recent Sessions ─────────────────────────────────── */}
          <Text style={styles.sectionTitle}>Последние сессии</Text>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={colors.accent.primary} />
            </View>
          ) : recentSessions.length === 0 ? (
            <Text style={styles.emptyText}>
              Пока нет завершённых сессий.{'\n'}Начните практику, чтобы увидеть статистику.
            </Text>
          ) : (
            recentSessions.map((session) => {
              const systemColor = contentSystems[session.systemId]?.color ?? colors.accent.primary;

              return (
                <View key={session.id} style={styles.sessionCard}>
                  <View style={[styles.sessionIconWrap, { backgroundColor: `${systemColor}22` }]}>
                    <Ionicons name="fitness-outline" size={18} color={systemColor} />
                  </View>
                  <View style={styles.sessionInfo}>
                    <Text style={styles.sessionName} numberOfLines={1}>
                      {session.practiceName}
                    </Text>
                    <Text style={styles.sessionMeta}>{formatDate(session.date)}</Text>
                  </View>
                  <Text style={styles.sessionDuration}>{formatMinutes(session.durationMin)}</Text>
                </View>
              );
            })
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
