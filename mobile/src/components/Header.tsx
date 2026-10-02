import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SPACING } from '../constants/theme';
import { useApp } from '../store/AppContext';

export const Header: React.FC<{ onOpenContract?: () => void }> = ({ onOpenContract }) => {
  const { user, arc, isDemoMode, toggleDemoMode } = useApp();

  const currentDay = arc ? arc.currentDay : 17;
  const phase = arc ? arc.phase : 'Foundation';
  const progressPct = Math.round((currentDay / 90) * 100);

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View>
          <Text style={styles.greeting}>Good morning, {user?.name.split(' ')[0] || 'Warrior'}</Text>
          <View style={styles.phaseBadge}>
            <Text style={styles.phaseText}>PHASE {currentDay <= 30 ? '1' : (currentDay <= 60 ? '2' : '3')}: {phase.toUpperCase()}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.dayBadge} onPress={onOpenContract}>
          <Text style={styles.dayText}>DAY {currentDay}</Text>
          <Text style={styles.totalDaysText}>/ 90</Text>
        </TouchableOpacity>
      </View>

      {/* 90-Day Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>{progressPct}% ARC PROGRESS</Text>
          <TouchableOpacity onPress={() => toggleDemoMode()}>
            <Text style={styles.demoTag}>{isDemoMode ? 'DEMO MODE (LIVE)' : 'SWITCH DEMO'}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${progressPct}%` }]} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceBorder
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm
  },
  greeting: {
    color: COLORS.primaryText,
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.5
  },
  phaseBadge: {
    backgroundColor: COLORS.secondarySurface,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginTop: 4,
    alignSelf: 'flex-start'
  },
  phaseText: {
    color: COLORS.iceAccent,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1
  },
  dayBadge: {
    backgroundColor: COLORS.secondarySurface,
    borderWidth: 1,
    borderColor: COLORS.iceAccent,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'baseline'
  },
  dayText: {
    color: COLORS.primaryText,
    fontSize: 16,
    fontWeight: '800'
  },
  totalDaysText: {
    color: COLORS.secondaryText,
    fontSize: 12,
    marginLeft: 2,
    fontWeight: '600'
  },
  progressContainer: {
    marginTop: SPACING.sm
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4
  },
  progressLabel: {
    color: COLORS.secondaryText,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8
  },
  demoTag: {
    color: COLORS.iceAccent,
    fontSize: 10,
    fontWeight: '700'
  },
  track: {
    height: 6,
    backgroundColor: COLORS.secondarySurface,
    borderRadius: 3,
    overflow: 'hidden'
  },
  fill: {
    height: '100%',
    backgroundColor: COLORS.iceAccent,
    borderRadius: 3
  }
});
