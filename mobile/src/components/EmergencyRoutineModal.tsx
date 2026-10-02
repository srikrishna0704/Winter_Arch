import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { COLORS, SPACING } from '../constants/theme';
import { useApp } from '../store/AppContext';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export const EmergencyRoutineModal: React.FC<Props> = ({ visible, onClose }) => {
  const { todayLog, habits, updateHabitStatus } = useApp();

  const incompleteHabits = (todayLog?.habitResults || []).filter(
    r => r.status === 'NOT_STARTED' || r.status === 'IN_PROGRESS' || r.status === 'MISSED'
  );

  const handleStartEmergency = () => {
    // Automatically convert incomplete habits to MINIMUM_ACHIEVED to protect zero-day streak!
    incompleteHabits.forEach(r => {
      updateHabitStatus(r.habitId, 'MINIMUM_ACHIEVED');
    });
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          <View style={styles.alertHeader}>
            <Text style={styles.alertIcon}>⚠️</Text>
            <Text style={styles.title}>YOUR DAY IS NOT OVER</Text>
          </View>

          <Text style={styles.subtitle}>
            Prevent a zero day at all costs. Execute micro-minimums now before shutdown.
          </Text>

          <Text style={styles.sectionHeader}>EMERGENCY PROTOCOL TASKS:</Text>

          {incompleteHabits.map((item) => {
            const h = habits.find(habit => habit._id === item.habitId);
            return (
              <View key={item.habitId} style={styles.taskRow}>
                <View>
                  <Text style={styles.taskName}>{item.habitName}</Text>
                  <Text style={styles.taskMicro}>Original Target: {h?.target || '1h'} → Micro Target: 10m / 5 pgs</Text>
                </View>
                <View style={styles.minBadge}>
                  <Text style={styles.minBadgeText}>MICRO-MINIMUM</Text>
                </View>
              </View>
            );
          })}

          {incompleteHabits.length === 0 && (
            <Text style={styles.allDoneText}>All core habits already completed today!</Text>
          )}

          <TouchableOpacity style={styles.emergencyBtn} onPress={handleStartEmergency}>
            <Text style={styles.emergencyBtnText}>EXECUTE EMERGENCY ROUTINE</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
            <Text style={styles.cancelBtnText}>DISMISS</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.md
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: COLORS.surface,
    borderColor: COLORS.danger,
    borderWidth: 2,
    borderRadius: 16,
    padding: SPACING.lg
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6
  },
  alertIcon: {
    fontSize: 20,
    marginRight: 6
  },
  title: {
    color: COLORS.danger,
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 1
  },
  subtitle: {
    color: COLORS.secondaryText,
    fontSize: 13,
    textAlign: 'center',
    marginBottom: SPACING.md
  },
  sectionHeader: {
    color: COLORS.mutedText,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: SPACING.xs
  },
  taskRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.secondarySurface,
    padding: SPACING.sm,
    borderRadius: 8,
    marginBottom: SPACING.xs,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.warning
  },
  taskName: {
    color: COLORS.primaryText,
    fontSize: 14,
    fontWeight: '700'
  },
  taskMicro: {
    color: COLORS.mutedText,
    fontSize: 11,
    marginTop: 2
  },
  minBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4
  },
  minBadgeText: {
    color: COLORS.warning,
    fontSize: 9,
    fontWeight: '800'
  },
  allDoneText: {
    color: COLORS.success,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    marginVertical: SPACING.md
  },
  emergencyBtn: {
    backgroundColor: COLORS.danger,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: SPACING.md
  },
  emergencyBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1
  },
  cancelBtn: {
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: SPACING.xs
  },
  cancelBtnText: {
    color: COLORS.secondaryText,
    fontSize: 11,
    fontWeight: '700'
  }
});
