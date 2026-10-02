import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS, SPACING } from '../constants/theme';
import { useApp } from '../store/AppContext';
import { CalendarHeatmap } from '../components/CalendarHeatmap';
import { apiRequest } from '../services/api';

export const ProgressScreen: React.FC = () => {
  const { arc } = useApp();
  const [analytics, setAnalytics] = useState<any>(null);
  const [achievements, setAchievements] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await apiRequest('/analytics/dashboard');
      if (res.success) setAnalytics(res.analytics);

      const achRes = await apiRequest('/achievements');
      if (achRes.success) setAchievements(achRes.achievements);
    };
    fetchData();
  }, []);

  const currentDay = arc ? arc.currentDay : 17;
  const heatmapData = analytics?.heatmap || Array.from({ length: 90 }, (_, i) => ({
    day: i + 1,
    date: `2026-10-${(i % 30) + 1}`,
    status: (i + 1) <= currentDay ? ((i % 3 === 0) ? 'excellent' : 'good') : 'future',
    score: (i + 1) <= currentDay ? 84 : 0
  }));

  const getLevelName = (day: number) => {
    if (day >= 90) return 'LEVEL 5: TRANSFORMED';
    if (day >= 60) return 'LEVEL 4: RELENTLESS';
    if (day >= 30) return 'LEVEL 3: DISCIPLINED';
    if (day >= 14) return 'LEVEL 2: BUILDER';
    return 'LEVEL 1: STARTER';
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>ANALYTICS & PROGRESS</Text>
          <Text style={styles.subtitle}>90-Day Discipline & Execution Performance</Text>
        </View>

        {/* Level / XP Banner */}
        <View style={styles.levelCard}>
          <View style={styles.levelRow}>
            <View>
              <Text style={styles.levelTitle}>{getLevelName(currentDay)}</Text>
              <Text style={styles.xpText}>TOTAL XP: {currentDay * 75 + 150} XP</Text>
            </View>
            <View style={styles.xpBadge}>
              <Text style={styles.xpBadgeText}>+10 XP / HABIT</Text>
            </View>
          </View>
        </View>

        {/* Overview Stats Cards */}
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>PERFECT DAYS</Text>
            <Text style={[styles.statValue, { color: COLORS.success }]}>{analytics?.perfectDays || 12}</Text>
            <Text style={styles.statSub}>Score ≥ 85</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statLabel}>AVG SLEEP</Text>
            <Text style={[styles.statValue, { color: COLORS.iceAccent }]}>{analytics?.averageSleep || '7.5'}h</Text>
            <Text style={styles.statSub}>Target: 7.5h</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statLabel}>MINIMUM STREAK</Text>
            <Text style={[styles.statValue, { color: COLORS.warning }]}>{analytics?.minimumStreak || 17}d</Text>
            <Text style={styles.statSub}>Zero-day protection</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statLabel}>CONSISTENCY</Text>
            <Text style={[styles.statValue, { color: COLORS.primaryText }]}>88%</Text>
            <Text style={styles.statSub}>30-Day Window</Text>
          </View>
        </View>

        {/* 90-Day Calendar Heatmap */}
        <CalendarHeatmap heatmapData={heatmapData} currentDay={currentDay} />

        {/* Achievements Section */}
        <View style={styles.achievementsSection}>
          <Text style={styles.sectionTitle}>ACHIEVEMENTS</Text>
          <View style={styles.achievementsList}>
            {(achievements.length > 0 ? achievements : [
              { id: '1', title: 'FIRST STEP', description: 'Completed Day 1', unlocked: true },
              { id: '2', title: '7 DAY FOUNDATION', description: '7 consecutive days', unlocked: true },
              { id: '3', title: 'ZERO DAY DEFENDER', description: '14 days minimum streak', unlocked: true },
              { id: '4', title: 'DISCIPLINE', description: 'Phase 1 (30 Days)', unlocked: false }
            ]).map((ach) => (
              <View key={ach.id} style={[styles.achCard, !ach.unlocked && styles.achLocked]}>
                <Text style={styles.achIcon}>{ach.unlocked ? '🏆' : '🔒'}</Text>
                <View style={styles.achTextCol}>
                  <Text style={[styles.achTitle, !ach.unlocked && styles.achTitleLocked]}>{ach.title}</Text>
                  <Text style={styles.achDesc}>{ach.description}</Text>
                </View>
                {ach.unlocked && (
                  <View style={styles.unlockedTag}>
                    <Text style={styles.unlockedText}>UNLOCKED</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  scrollContent: {
    paddingBottom: SPACING.xxl
  },
  header: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceBorder
  },
  title: {
    color: COLORS.primaryText,
    fontSize: 20,
    fontWeight: '800'
  },
  subtitle: {
    color: COLORS.secondaryText,
    fontSize: 12,
    marginTop: 2
  },
  levelCard: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.iceAccent,
    borderWidth: 1,
    borderRadius: 12,
    padding: SPACING.md,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md
  },
  levelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  levelTitle: {
    color: COLORS.iceAccent,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1
  },
  xpText: {
    color: COLORS.primaryText,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2
  },
  xpBadge: {
    backgroundColor: COLORS.secondarySurface,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  xpBadgeText: {
    color: COLORS.secondaryText,
    fontSize: 9,
    fontWeight: '800'
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    gap: 8
  },
  statBox: {
    width: '48%',
    backgroundColor: COLORS.surface,
    borderColor: COLORS.surfaceBorder,
    borderWidth: 1,
    borderRadius: 10,
    padding: SPACING.md
  },
  statLabel: {
    color: COLORS.mutedText,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1
  },
  statValue: {
    fontSize: 24,
    fontWeight: '900',
    marginVertical: 4
  },
  statSub: {
    color: COLORS.secondaryText,
    fontSize: 10
  },
  achievementsSection: {
    marginHorizontal: SPACING.md,
    marginTop: SPACING.lg
  },
  sectionTitle: {
    color: COLORS.secondaryText,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: SPACING.sm
  },
  achievementsList: {
    gap: 8
  },
  achCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderColor: COLORS.surfaceBorder,
    borderWidth: 1,
    borderRadius: 10,
    padding: SPACING.sm
  },
  achLocked: {
    opacity: 0.5
  },
  achIcon: {
    fontSize: 20,
    marginRight: 10
  },
  achTextCol: {
    flex: 1
  },
  achTitle: {
    color: COLORS.primaryText,
    fontSize: 13,
    fontWeight: '800'
  },
  achTitleLocked: {
    color: COLORS.mutedText
  },
  achDesc: {
    color: COLORS.secondaryText,
    fontSize: 11,
    marginTop: 1
  },
  unlockedTag: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  unlockedText: {
    color: COLORS.success,
    fontSize: 8,
    fontWeight: '900'
  }
});
