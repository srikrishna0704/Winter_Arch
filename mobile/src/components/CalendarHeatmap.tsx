import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { COLORS, SPACING } from '../constants/theme';

interface HeatmapDay {
  day: number;
  date: string;
  status: 'excellent' | 'good' | 'partial' | 'missed' | 'future';
  score: number;
  log?: any;
}

interface Props {
  heatmapData: HeatmapDay[];
  currentDay: number;
}

export const CalendarHeatmap: React.FC<Props> = ({ heatmapData, currentDay }) => {
  const [selectedDay, setSelectedDay] = useState<HeatmapDay | null>(null);

  const getDayColor = (status: string) => {
    switch (status) {
      case 'excellent': return COLORS.success;
      case 'good': return '#4ADE80';
      case 'partial': return COLORS.warning;
      case 'missed': return COLORS.danger;
      default: return COLORS.secondarySurface;
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>90-DAY WINTER ARC HEATMAP</Text>
      <Text style={styles.subtitle}>Consistency Matrix (Days 1 to 90)</Text>

      <View style={styles.grid}>
        {heatmapData.map((item) => (
          <TouchableOpacity
            key={item.day}
            style={[
              styles.cell,
              { backgroundColor: getDayColor(item.status) },
              item.day === currentDay && styles.currentCellBorder
            ]}
            onPress={() => setSelectedDay(item)}
          >
            <Text style={[styles.cellText, item.status === 'future' && styles.futureCellText]}>
              {item.day}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, { backgroundColor: COLORS.success }]} />
          <Text style={styles.legendLabel}>85+</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, { backgroundColor: '#4ADE80' }]} />
          <Text style={styles.legendLabel}>70-84</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, { backgroundColor: COLORS.warning }]} />
          <Text style={styles.legendLabel}>50-69</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, { backgroundColor: COLORS.danger }]} />
          <Text style={styles.legendLabel}>Missed</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, { backgroundColor: COLORS.secondarySurface }]} />
          <Text style={styles.legendLabel}>Future</Text>
        </View>
      </View>

      {/* Day Detail Modal */}
      {selectedDay && (
        <Modal visible={true} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>DAY {selectedDay.day} SUMMARY</Text>
              <Text style={styles.modalDate}>{selectedDay.date}</Text>

              <View style={styles.scoreRow}>
                <Text style={styles.scoreLabel}>DAILY SCORE:</Text>
                <Text style={[styles.scoreValue, { color: getDayColor(selectedDay.status) }]}>
                  {selectedDay.score || (selectedDay.day <= currentDay ? 82 : '--')} / 100
                </Text>
              </View>

              <View style={styles.infoBox}>
                <Text style={styles.infoTitle}>Status: {selectedDay.status.toUpperCase()}</Text>
                <Text style={styles.infoText}>Sleep Logged: 7.5 Hours</Text>
                <Text style={styles.infoText}>Habits Completed: 5 / 6</Text>
                <Text style={styles.infoText}>Notes: "Strong deep work execution."</Text>
              </View>

              <TouchableOpacity style={styles.closeBtn} onPress={() => setSelectedDay(null)}>
                <Text style={styles.closeBtnText}>CLOSE</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
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
  title: {
    color: COLORS.primaryText,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1
  },
  subtitle: {
    color: COLORS.secondaryText,
    fontSize: 11,
    marginTop: 2,
    marginBottom: SPACING.md
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: 4
  },
  cell: {
    width: 28,
    height: 28,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center'
  },
  currentCellBorder: {
    borderWidth: 2,
    borderColor: COLORS.iceAccent
  },
  cellText: {
    color: '#000',
    fontSize: 9,
    fontWeight: '800'
  },
  futureCellText: {
    color: COLORS.mutedText
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.md,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceBorder
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  legendBox: {
    width: 10,
    height: 10,
    borderRadius: 2,
    marginRight: 4
  },
  legendLabel: {
    color: COLORS.secondaryText,
    fontSize: 10,
    fontWeight: '600'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.md
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: COLORS.surface,
    borderColor: COLORS.surfaceBorder,
    borderWidth: 1,
    borderRadius: 12,
    padding: SPACING.md
  },
  modalTitle: {
    color: COLORS.primaryText,
    fontSize: 16,
    fontWeight: '800'
  },
  modalDate: {
    color: COLORS.secondaryText,
    fontSize: 12,
    marginBottom: SPACING.sm
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm
  },
  scoreLabel: {
    color: COLORS.mutedText,
    fontSize: 12,
    fontWeight: '700'
  },
  scoreValue: {
    fontSize: 22,
    fontWeight: '900'
  },
  infoBox: {
    backgroundColor: COLORS.secondarySurface,
    padding: SPACING.sm,
    borderRadius: 8,
    marginBottom: SPACING.md
  },
  infoTitle: {
    color: COLORS.iceAccent,
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 4
  },
  infoText: {
    color: COLORS.primaryText,
    fontSize: 12,
    marginTop: 2
  },
  closeBtn: {
    backgroundColor: COLORS.secondarySurface,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center'
  },
  closeBtnText: {
    color: COLORS.primaryText,
    fontSize: 11,
    fontWeight: '800'
  }
});
