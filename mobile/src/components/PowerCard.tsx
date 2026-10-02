import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SPACING } from '../constants/theme';
import { HabitResult } from '../types';

interface Props {
  habitResults: HabitResult[];
  onSelectPower?: (powerId: string) => void;
}

export const PowerCard: React.FC<Props> = ({ habitResults, onSelectPower }) => {
  const calcPower = (powerId: string) => {
    const list = habitResults.filter(r => (r.powerId || '').toLowerCase() === powerId);
    if (list.length === 0) return 80;
    const completed = list.filter(r => r.status === 'TARGET_ACHIEVED' || r.status === 'STRETCH_ACHIEVED' || r.status === 'MINIMUM_ACHIEVED').length;
    return Math.round((completed / list.length) * 100);
  };

  const mindPct = calcPower('mind');
  const bodyPct = calcPower('body');
  const futurePct = calcPower('future');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>THREE POWERS</Text>

      <View style={styles.row}>
        {/* MIND */}
        <TouchableOpacity 
          style={[styles.powerBox, { borderColor: COLORS.mind }]}
          onPress={() => onSelectPower && onSelectPower('mind')}
        >
          <Text style={[styles.powerName, { color: COLORS.mind }]}>MIND</Text>
          <Text style={styles.powerScore}>{mindPct}%</Text>
          <View style={styles.miniBarTrack}>
            <View style={[styles.miniBarFill, { width: `${mindPct}%`, backgroundColor: COLORS.mind }]} />
          </View>
        </TouchableOpacity>

        {/* BODY */}
        <TouchableOpacity 
          style={[styles.powerBox, { borderColor: COLORS.body }]}
          onPress={() => onSelectPower && onSelectPower('body')}
        >
          <Text style={[styles.powerName, { color: COLORS.body }]}>BODY</Text>
          <Text style={styles.powerScore}>{bodyPct}%</Text>
          <View style={styles.miniBarTrack}>
            <View style={[styles.miniBarFill, { width: `${bodyPct}%`, backgroundColor: COLORS.body }]} />
          </View>
        </TouchableOpacity>

        {/* FUTURE */}
        <TouchableOpacity 
          style={[styles.powerBox, { borderColor: COLORS.future }]}
          onPress={() => onSelectPower && onSelectPower('future')}
        >
          <Text style={[styles.powerName, { color: COLORS.future }]}>FUTURE</Text>
          <Text style={styles.powerScore}>{futurePct}%</Text>
          <View style={styles.miniBarTrack}>
            <View style={[styles.miniBarFill, { width: `${futurePct}%`, backgroundColor: COLORS.future }]} />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md
  },
  title: {
    color: COLORS.secondaryText,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: SPACING.xs
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  powerBox: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderRadius: 10,
    padding: SPACING.sm,
    marginHorizontal: 3,
    alignItems: 'center'
  },
  powerName: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1
  },
  powerScore: {
    color: COLORS.primaryText,
    fontSize: 18,
    fontWeight: '800',
    marginVertical: 2
  },
  miniBarTrack: {
    width: '100%',
    height: 4,
    backgroundColor: COLORS.secondarySurface,
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 4
  },
  miniBarFill: {
    height: '100%',
    borderRadius: 2
  }
});
