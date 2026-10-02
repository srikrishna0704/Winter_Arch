import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SPACING } from '../constants/theme';
import { Habit, HabitResult, HabitStatus } from '../types';

interface Props {
  habit: Habit;
  result: HabitResult;
  onUpdateStatus: (status: HabitStatus) => void;
}

export const HabitItemCard: React.FC<Props> = ({ habit, result, onUpdateStatus }) => {
  const currentStatus = result.status;

  const getStatusBadge = () => {
    switch (currentStatus) {
      case 'STRETCH_ACHIEVED':
        return { label: '🔥 STRETCH ACHIEVED', color: COLORS.stretchAchieved };
      case 'TARGET_ACHIEVED':
        return { label: '✓ TARGET ACHIEVED', color: COLORS.targetAchieved };
      case 'MINIMUM_ACHIEVED':
        return { label: '⚡ MINIMUM ACHIEVED', color: COLORS.minimumAchieved };
      case 'IN_PROGRESS':
        return { label: '⏳ IN PROGRESS', color: COLORS.inProgress };
      case 'MISSED':
        return { label: '✕ MISSED', color: COLORS.missed };
      case 'SKIPPED':
        return { label: '⊘ SKIPPED', color: COLORS.skipped };
      default:
        return { label: 'NOT STARTED', color: COLORS.notStarted };
    }
  };

  const badge = getStatusBadge();

  return (
    <View style={[styles.card, habit.importance === 'non-negotiable' && styles.nonNegotiableBorder]}>
      <View style={styles.topHeader}>
        <View style={styles.titleArea}>
          <Text style={styles.habitName}>{habit.name}</Text>
          <View style={styles.badgeRow}>
            <Text style={[styles.powerTag, { color: COLORS[habit.powerId as keyof typeof COLORS] || COLORS.iceAccent }]}>
              {(habit.powerId || 'mind').toUpperCase()}
            </Text>
            {habit.importance === 'non-negotiable' && (
              <View style={styles.nonNegBadge}>
                <Text style={styles.nonNegText}>NON-NEGOTIABLE</Text>
              </View>
            )}
          </View>
        </View>

        <View style={[styles.statusPill, { backgroundColor: badge.color }]}>
          <Text style={styles.statusPillText}>{badge.label}</Text>
        </View>
      </View>

      {/* Target levels details */}
      <View style={styles.levelsRow}>
        <View style={styles.levelCol}>
          <Text style={styles.levelLabel}>MINIMUM</Text>
          <Text style={styles.levelVal}>{habit.minimum}</Text>
        </View>
        <View style={styles.levelDivider} />
        <View style={styles.levelCol}>
          <Text style={styles.levelLabel}>TARGET</Text>
          <Text style={[styles.levelVal, { color: COLORS.primaryText }]}>{habit.target}</Text>
        </View>
        <View style={styles.levelDivider} />
        <View style={styles.levelCol}>
          <Text style={styles.levelLabel}>STRETCH</Text>
          <Text style={styles.levelVal}>{habit.stretch}</Text>
        </View>
      </View>

      {/* 1-Tap Quick Action Buttons */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={[styles.actionBtn, currentStatus === 'MINIMUM_ACHIEVED' && styles.activeMinBtn]}
          onPress={() => onUpdateStatus('MINIMUM_ACHIEVED')}
        >
          <Text style={[styles.actionBtnText, currentStatus === 'MINIMUM_ACHIEVED' && styles.activeBtnText]}>
            ⚡ MINIMUM
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, styles.primaryTargetBtn, currentStatus === 'TARGET_ACHIEVED' && styles.activeTargetBtn]}
          onPress={() => onUpdateStatus('TARGET_ACHIEVED')}
        >
          <Text style={[styles.actionBtnText, { color: COLORS.success }, currentStatus === 'TARGET_ACHIEVED' && styles.activeBtnText]}>
            ✓ TARGET
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, currentStatus === 'STRETCH_ACHIEVED' && styles.activeStretchBtn]}
          onPress={() => onUpdateStatus('STRETCH_ACHIEVED')}
        >
          <Text style={[styles.actionBtnText, { color: '#C084FC' }, currentStatus === 'STRETCH_ACHIEVED' && styles.activeBtnText]}>
            🔥 STRETCH
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, styles.missedBtn, currentStatus === 'MISSED' && styles.activeMissedBtn]}
          onPress={() => onUpdateStatus('MISSED')}
        >
          <Text style={[styles.actionBtnText, { color: COLORS.danger }, currentStatus === 'MISSED' && styles.activeBtnText]}>
            ✕ MISSED
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.surfaceBorder,
    borderWidth: 1,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md
  },
  nonNegotiableBorder: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.iceAccent
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm
  },
  titleArea: {
    flex: 1,
    marginRight: 8
  },
  habitName: {
    color: COLORS.primaryText,
    fontSize: 16,
    fontWeight: '700'
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4
  },
  powerTag: {
    fontSize: 10,
    fontWeight: '800',
    marginRight: 6
  },
  nonNegBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  nonNegText: {
    color: COLORS.danger,
    fontSize: 9,
    fontWeight: '800'
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  statusPillText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '800'
  },
  levelsRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.secondarySurface,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    marginBottom: SPACING.sm
  },
  levelCol: {
    flex: 1,
    alignItems: 'center'
  },
  levelDivider: {
    width: 1,
    height: 20,
    backgroundColor: COLORS.surfaceBorder
  },
  levelLabel: {
    color: COLORS.mutedText,
    fontSize: 9,
    fontWeight: '700'
  },
  levelVal: {
    color: COLORS.secondaryText,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  actionBtn: {
    flex: 1,
    backgroundColor: COLORS.secondarySurface,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
    marginHorizontal: 2,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder
  },
  primaryTargetBtn: {
    borderColor: 'rgba(34, 197, 94, 0.3)'
  },
  missedBtn: {
    borderColor: 'rgba(239, 68, 68, 0.2)'
  },
  actionBtnText: {
    color: COLORS.secondaryText,
    fontSize: 10,
    fontWeight: '800'
  },
  activeMinBtn: {
    backgroundColor: COLORS.minimumAchieved,
    borderColor: COLORS.minimumAchieved
  },
  activeTargetBtn: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success
  },
  activeStretchBtn: {
    backgroundColor: '#9333EA',
    borderColor: '#9333EA'
  },
  activeMissedBtn: {
    backgroundColor: COLORS.danger,
    borderColor: COLORS.danger
  },
  activeBtnText: {
    color: '#FFFFFF'
  }
});
