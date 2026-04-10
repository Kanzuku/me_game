/**
 * Dashboard Screen — Main game HUD
 * Shows: character level, all 8 stats, active quests, streak, random event alert
 */
import React, { useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, RefreshControl, Dimensions,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { statsApi, questsApi, simulationApi } from '../api/client';
import { useStatsStore, useStreakStore } from '../store';
import StatBar from '../components/StatBar';
import QuestCard from '../components/QuestCard';
import XPBar from '../components/XPBar';
import StreakBadge from '../components/StreakBadge';
import EventAlert from '../components/EventAlert';
import { COLORS, FONTS, SPACING } from '../theme';

const { width } = Dimensions.get('window');
const STAT_COLS = 2;

const STAT_CONFIG = [
  { key: 'stat_health',     label: 'Health',     icon: '❤️', color: '#E24B4A' },
  { key: 'stat_energy',     label: 'Energy',     icon: '⚡', color: '#EF9F27' },
  { key: 'stat_wealth',     label: 'Wealth',     icon: '💰', color: '#1D9E75' },
  { key: 'stat_knowledge',  label: 'Knowledge',  icon: '📚', color: '#7F77DD' },
  { key: 'stat_happiness',  label: 'Happiness',  icon: '☀️', color: '#FAC775' },
  { key: 'stat_discipline', label: 'Discipline', icon: '🎯', color: '#378ADD' },
  { key: 'stat_career',     label: 'Career',     icon: '📈', color: '#5DCAA5' },
  { key: 'stat_social',     label: 'Social',     icon: '🤝', color: '#ED93B1' },
];

export default function DashboardScreen() {
  const qc = useQueryClient();
  const { setStats } = useStatsStore();
  const { streakDays, updateStreak } = useStreakStore();

  const { data: stats, isLoading: statsLoading, refetch: refetchStats } =
    useQuery({ queryKey: ['stats'], queryFn: () => statsApi.get().then(r => r.data) });

  const { data: quests, isLoading: questsLoading, refetch: refetchQuests } =
    useQuery({ queryKey: ['quests', 'active'], queryFn: () => questsApi.active().then(r => r.data) });

  const { data: pendingEvent } =
    useQuery({
      queryKey: ['pending_event'],
      queryFn: () => simulationApi.generateEvent().then(r => r.data),
      staleTime: 1000 * 60 * 60 * 4, // Re-roll event every 4h
      retry: false,
    });

  useEffect(() => {
    if (stats) setStats(stats);
    updateStreak();
  }, [stats]);

  const generateQuestsMutation = useMutation({
    mutationFn: () => questsApi.generate('daily', 3),
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      qc.invalidateQueries({ queryKey: ['quests'] });
    },
  });

  const completeQuestMutation = useMutation({
    mutationFn: (id: string) => questsApi.complete(id),
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      qc.invalidateQueries({ queryKey: ['quests'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
    },
  });

  const onRefresh = useCallback(() => {
    refetchStats();
    refetchQuests();
  }, []);

  const activeQuests = quests?.quests || quests || [];
  const level = stats?.level || 1;
  const totalXP = stats?.total_xp || 0;
  const xpForNext = ((level + 1) ** 2) * 100;
  const xpCurrent = (level ** 2) * 100;
  const xpProgress = Math.max(0, Math.min(1, (totalXP - xpCurrent) / (xpForNext - xpCurrent)));

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={statsLoading} onRefresh={onRefresh} />}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.levelText}>Level {level}</Text>
          <Text style={styles.subtitleText}>Game Master is watching</Text>
        </View>
        <StreakBadge days={streakDays} />
      </View>

      {/* XP Bar */}
      <XPBar progress={xpProgress} currentXP={totalXP} nextLevelXP={xpForNext} />

      {/* Stats Grid */}
      <Text style={styles.sectionTitle}>Your Stats</Text>
      <View style={styles.statsGrid}>
        {STAT_CONFIG.map((stat) => (
          <StatBar
            key={stat.key}
            label={stat.label}
            icon={stat.icon}
            value={stats?.[stat.key as keyof typeof stats] as number || 0}
            color={stat.color}
          />
        ))}
      </View>

      {/* Random Event Alert */}
      {pendingEvent && (
        <EventAlert
          event={pendingEvent}
          onPress={() => router.push({ pathname: '/event', params: { eventId: pendingEvent.event_id } })}
        />
      )}

      {/* Active Quests */}
      <View style={styles.questsHeader}>
        <Text style={styles.sectionTitle}>Active Quests</Text>
        <TouchableOpacity
          style={styles.generateBtn}
          onPress={() => generateQuestsMutation.mutate()}
          disabled={generateQuestsMutation.isPending}
        >
          <Text style={styles.generateBtnText}>
            {generateQuestsMutation.isPending ? 'Generating…' : '+ New'}
          </Text>
        </TouchableOpacity>
      </View>

      {activeQuests.length === 0 ? (
        <TouchableOpacity
          style={styles.emptyQuests}
          onPress={() => generateQuestsMutation.mutate()}
        >
          <Text style={styles.emptyQuestsText}>Tap to generate today's quests</Text>
        </TouchableOpacity>
      ) : (
        activeQuests.map((q: any) => (
          <QuestCard
            key={q.id}
            quest={q}
            onComplete={() => completeQuestMutation.mutate(q.id)}
          />
        ))
      )}

      {/* Simulation CTA */}
      <TouchableOpacity
        style={styles.simulationCTA}
        onPress={() => router.push('/simulation')}
      >
        <Text style={styles.ctaText}>⏩ Simulate your next 10 years</Text>
      </TouchableOpacity>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg, paddingHorizontal: SPACING.md },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 60, paddingBottom: SPACING.md },
  levelText: { fontSize: 28, fontWeight: '700', color: COLORS.text, fontFamily: FONTS.bold },
  subtitleText: { fontSize: 13, color: COLORS.muted, marginTop: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: COLORS.text, marginBottom: SPACING.sm, marginTop: SPACING.lg },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: SPACING.lg },
  questsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  generateBtn: { backgroundColor: COLORS.accent, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 },
  generateBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  emptyQuests: {
    borderWidth: 1, borderColor: COLORS.border, borderStyle: 'dashed',
    borderRadius: 12, padding: SPACING.xl, alignItems: 'center', marginBottom: SPACING.md,
  },
  emptyQuestsText: { color: COLORS.muted, fontSize: 14 },
  simulationCTA: {
    backgroundColor: COLORS.surface, borderRadius: 14, padding: SPACING.lg,
    alignItems: 'center', marginTop: SPACING.lg, borderWidth: 1, borderColor: COLORS.border,
  },
  ctaText: { color: COLORS.accent, fontSize: 15, fontWeight: '600' },
});
