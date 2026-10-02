import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SPACING } from '../constants/theme';
import { ScoreBreakdown } from '../types';

interface Props {
  score: number;
  breakdown: ScoreBreakdown | null;
}

export const ScoreBreakdownCard: React.FC<Props> = ({ score, breakdown }) => {
  const [expanded, setExpanded] = useState(false);

  const getScoreColor = (val: number) => {
    if (val >= 85) return COLORS.success;
    if (val >= 70) return COLORS.warning;
    return COLORS.danger;
  };

  const defaultBreakdown = breakdown || {
    nonNegotiables: { earned: 38, max: 40 },
    habits: { earned: 20, max: 25 },
    goals: { earned: 12, max: 15 },
    sleep: { earned: 7, max: 10 },
    reflection: { earned: 5, max: 5 },
    routine: { earned: 0, max: 5 }
  };

  return (
    <View style={styles.card}>
      <TouchableOpacity 
        style={styles.headerRow} 
        activeOpacity={0.8}
        onPress={() => setExpanded(!expanded)}
      >
        <View>
          <Text style={styles.label}>TODAY'S SCORE</Text>
          <Text style={styles.subtext}>Calculated from weighted daily execution</Text>
        </View>

        <View style={styles.scoreContainer}>
          <Text style={[styles.scoreValue, { color: getScoreColor(score) }]}>{score}</Text>
          <Text style={styles.scoreMax}>/ 100</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setExpanded(!expanded)}>
        <Text style={styles.toggleText}>{expanded ? '▲ Hide Formula Breakdown' : '▼ Show Formula Breakdown'}</Text>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.breakdownContainer}>
          <View style={styles.itemRow}>
            <Text style={styles.itemName}>Non-negotiables (40%)</Text>
            <Text style={styles.itemScore}>{defaultBreakdown.nonNegotiables.earned} / {defaultBreakdown.nonNegotiables.max}</Text>
          </View>
          <View style={styles.itemRow}>
            <Text style={styles.itemName}>Regular Habits (25%)</Text>
            <Text style={styles.itemScore}>{defaultBreakdown.habits.earned} / {defaultBreakdown.habits.max}</Text>
          </View>
          <View style={styles.itemRow}>
            <Text style={styles.itemName}>Goal Milestones (15%)</Text>
            <Text style={styles.itemScore}>{defaultBreakdown.goals.earned} / {defaultBreakdown.goals.max}</Text>
          </View>
          <View style={styles.itemRow}>
            <Text style={styles.itemName}>Sleep Quality (10%)</Text>
            <Text style={styles.itemScore}>{defaultBreakdown.sleep.earned} / {defaultBreakdown.sleep.max}</Text>
          </View>
          <View style={styles.itemRow}>
            <Text style={styles.itemName}>Daily Reflection (5%)</Text>
            <Text style={styles.itemScore}>{defaultBreakdown.reflection.earned} / {defaultBreakdown.reflection.max}</Text>
          </View>
          <View style={styles.itemRow}>
            <Text style={styles.itemName}>Routine Consistency (5%)</Text>
            <Text style={styles.itemScore}>{defaultBreakdown.routine.earned} / {defaultBreakdown.routine.max}</Text>
          </View>
        </View>
      )}
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
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  label: {
    color: COLORS.secondaryText,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1
  },
  subtext: {
    color: COLORS.mutedText,
    fontSize: 12,
    marginTop: 2
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'baseline'
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: '900'
  },
  scoreMax: {
    color: COLORS.secondaryText,
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 4
  },
  toggleText: {
    color: COLORS.iceAccent,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 10,
    textAlign: 'center'
  },
  breakdownContainer: {
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceBorder
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4
  },
  itemName: {
    color: COLORS.primaryText,
    fontSize: 12,
    fontWeight: '500'
  },
  itemScore: {
    color: COLORS.iceAccent,
    fontSize: 12,
    fontWeight: '700'
  }
});
