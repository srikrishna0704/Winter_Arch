import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { COLORS, SPACING } from '../constants/theme';
import { useApp } from '../store/AppContext';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export const EnergyCheckInModal: React.FC<Props> = ({ visible, onClose }) => {
  const { todayLog, updateEnergyLevel } = useApp();

  const handleSelect = async (level: number) => {
    await updateEnergyLevel(level);
    onClose();
  };

  const getPlanDescription = (level: number) => {
    if (level <= 2) return 'LOW ENERGY PLAN: Reduces optional work; preserves all Non-Negotiables.';
    if (level === 3) return 'NORMAL PLAN: Standard baseline execution.';
    return 'HIGH PERFORMANCE PLAN: Maximizes stretch targets & deep focus hours.';
  };

  const currentEnergy = todayLog?.energy || 3;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          <Text style={styles.title}>HOW IS YOUR ENERGY TODAY?</Text>
          <Text style={styles.subtitle}>Select your morning state to calibrate your daily routine.</Text>

          <View style={styles.ratingsRow}>
            {[1, 2, 3, 4, 5].map((lvl) => (
              <TouchableOpacity
                key={lvl}
                style={[
                  styles.ratingBtn,
                  currentEnergy === lvl && styles.selectedRatingBtn
                ]}
                onPress={() => handleSelect(lvl)}
              >
                <Text style={[styles.ratingText, currentEnergy === lvl && styles.selectedRatingText]}>
                  {lvl}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.planInfoBox}>
            <Text style={styles.planInfoText}>{getPlanDescription(currentEnergy)}</Text>
          </View>

          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>CONFIRM PLAN</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.md
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: COLORS.surface,
    borderColor: COLORS.surfaceBorder,
    borderWidth: 1,
    borderRadius: 16,
    padding: SPACING.lg
  },
  title: {
    color: COLORS.primaryText,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.5,
    textAlign: 'center'
  },
  subtitle: {
    color: COLORS.secondaryText,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: SPACING.md
  },
  ratingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md
  },
  ratingBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.secondarySurface,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    justifyContent: 'center',
    alignItems: 'center'
  },
  selectedRatingBtn: {
    backgroundColor: COLORS.iceAccent,
    borderColor: COLORS.iceAccent
  },
  ratingText: {
    color: COLORS.primaryText,
    fontSize: 18,
    fontWeight: '800'
  },
  selectedRatingText: {
    color: '#000'
  },
  planInfoBox: {
    backgroundColor: COLORS.secondarySurface,
    padding: SPACING.md,
    borderRadius: 8,
    marginBottom: SPACING.md,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.iceAccent
  },
  planInfoText: {
    color: COLORS.primaryText,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 18
  },
  closeBtn: {
    backgroundColor: COLORS.iceAccent,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center'
  },
  closeBtnText: {
    color: '#000',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1
  }
});
