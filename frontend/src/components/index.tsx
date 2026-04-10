/**
 * Shared UI Components
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { COLORS, SPACING, RADIUS } from '../theme';

const { width } = Dimensions.get('window');
const STAT_WIDTH = (width - SPACING.md * 2 - 10) / 2;

// ── StatBar ────────────────────────────────────────────────────
interface StatBarProps {
  label: string;
  icon: string;
  value: number;   // 0–100
  color: string;
}

export const StatBar: React.FC<StatBarProps> = ({ label, icon, value, color }) => (
  <View style={[statStyles.container, { width: STAT_WIDTH }]}>
    <View style={statStyles.labelRow}>
      <Text style={statStyles.icon}>{icon}</Text>
      <Text style={statStyles.label}>{label}</Text>
      <Text style={[statStyles.value, { color }]}>{value}</Text>
    </View>
    <View style={statStyles.track}>
      <View style={[statStyles.fill, { width: `${value}%`, backgroundColor: color }]} />
    </View>
  </View>
);

const statStyles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.md,
    padding: SPACING.sm + 4, borderWidth: 1, borderColor: COLORS.border,
  },
  labelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  icon: { fontSize: 14, marginRight: 5 },
  label: { flex: 1, fontSize: 12, color: COLORS.muted, fontWeight: '500' },
  value: { fontSize: 14, fontWeight: '700' },
  track: {
    height: 4, backgroundColor: COLORS.elevated,
    borderRadius: RADIUS.full, overflow: 'hidden',
  },
  fill: { height: 4, borderRadius: RADIUS.full },
});

// ── XPBar ─────────────────────────────────────────────────────
interface XPBarProps {
  progress: number;   // 0–1
  currentXP: number;
  nextLevelXP: number;
}

export const XPBar: React.FC<XPBarProps> = ({ progress, currentXP, nextLevelXP }) => (
  <View style={xpStyles.container}>
    <View style={xpStyles.track}>
      <View style={[xpStyles.fill, { width: `${Math.round(progress * 100)}%` }]} />
    </View>
    <Text style={xpStyles.label}>{currentXP.toLocaleString()} XP · Next level at {nextLevelXP.toLocaleString()}</Text>
  </View>
);

const xpStyles = StyleSheet.create({
  container: { marginBottom: SPACING.lg },
  track: { height: 6, backgroundColor: COLORS.surface, borderRadius: RADIUS.full, overflow: 'hidden', marginBottom: 5 },
  fill: { height: 6, backgroundColor: COLORS.accent, borderRadius: RADIUS.full },
  label: { fontSize: 11, color: COLORS.muted, textAlign: 'right' },
});

// ── StreakBadge ────────────────────────────────────────────────
export const StreakBadge: React.FC<{ days: number }> = ({ days }) => (
  <View style={streakStyles.container}>
    <Text style={streakStyles.fire}>🔥</Text>
    <Text style={streakStyles.count}>{days}</Text>
  </View>
);

const streakStyles = StyleSheet.create({
  container: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#EF9F2722',
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: RADIUS.full,
    gap: 4,
  },
  fire: { fontSize: 16 },
  count: { fontSize: 16, fontWeight: '700', color: '#EF9F27' },
});

// ── QuestCard ─────────────────────────────────────────────────
interface QuestCardProps {
  quest: {
    id: string;
    title: string;
    description: string;
    xp_reward: number;
    difficulty?: number;
    stat_rewards?: Record<string, number>;
    due_at?: string;
  };
  onComplete: () => void;
}

const QUEST_TYPE_COLOR: Record<string, string> = {
  daily:  COLORS.info,
  weekly: COLORS.accent,
  main:   COLORS.warning,
  skill:  COLORS.success,
};

export const QuestCard: React.FC<QuestCardProps> = ({ quest, onComplete }) => {
  const statList = quest.stat_rewards
    ? Object.entries(quest.stat_rewards)
        .filter(([_, v]) => v !== 0)
        .map(([k, v]) => `${v > 0 ? '+' : ''}${v} ${k}`)
        .join(' · ')
    : null;

  return (
    <View style={questStyles.card}>
      <View style={questStyles.header}>
        <Text style={questStyles.title} numberOfLines={2}>{quest.title}</Text>
        <View style={questStyles.xpBadge}>
          <Text style={questStyles.xpText}>+{quest.xp_reward} XP</Text>
        </View>
      </View>
      <Text style={questStyles.desc} numberOfLines={3}>{quest.description}</Text>
      {statList && <Text style={questStyles.statRewards}>{statList}</Text>}
      <TouchableOpacity style={questStyles.completeBtn} onPress={onComplete}>
        <Text style={questStyles.completeBtnText}>Mark Complete</Text>
      </TouchableOpacity>
    </View>
  );
};

const questStyles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.lg,
    padding: SPACING.md, marginBottom: SPACING.sm,
    borderWidth: 1, borderColor: COLORS.border,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6, gap: SPACING.sm },
  title: { flex: 1, fontSize: 15, fontWeight: '700', color: COLORS.text },
  xpBadge: {
    backgroundColor: COLORS.accentBg, borderRadius: RADIUS.full,
    paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start',
  },
  xpText: { fontSize: 12, fontWeight: '700', color: COLORS.accent },
  desc: { fontSize: 13, color: COLORS.muted, lineHeight: 19, marginBottom: 8 },
  statRewards: { fontSize: 12, color: COLORS.success, marginBottom: SPACING.sm },
  completeBtn: {
    backgroundColor: COLORS.accent, borderRadius: RADIUS.md,
    padding: SPACING.sm + 2, alignItems: 'center',
  },
  completeBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});

// ── EventAlert ────────────────────────────────────────────────
interface EventAlertProps {
  event: { title: string; category: string; description: string };
  onPress: () => void;
}

export const EventAlert: React.FC<EventAlertProps> = ({ event, onPress }) => (
  <TouchableOpacity style={alertStyles.container} onPress={onPress} activeOpacity={0.85}>
    <View style={alertStyles.pulse} />
    <View style={alertStyles.content}>
      <Text style={alertStyles.badge}>⚡ LIFE EVENT</Text>
      <Text style={alertStyles.title}>{event.title}</Text>
      <Text style={alertStyles.desc} numberOfLines={2}>{event.description}</Text>
    </View>
    <Text style={alertStyles.arrow}>→</Text>
  </TouchableOpacity>
);

const alertStyles = StyleSheet.create({
  container: {
    backgroundColor: '#EF9F2710', borderRadius: RADIUS.lg, padding: SPACING.md,
    marginBottom: SPACING.md, borderWidth: 1, borderColor: '#EF9F2740',
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
  },
  pulse: {
    width: 10, height: 10, borderRadius: 5, backgroundColor: '#EF9F27',
    alignSelf: 'flex-start', marginTop: 2,
  },
  content: { flex: 1 },
  badge: { fontSize: 10, color: '#EF9F27', fontWeight: '800', letterSpacing: 1, marginBottom: 4 },
  title: { fontSize: 15, fontWeight: '700', color: COLORS.text, marginBottom: 3 },
  desc: { fontSize: 12, color: COLORS.muted, lineHeight: 17 },
  arrow: { fontSize: 18, color: '#EF9F27', fontWeight: '700' },
});
