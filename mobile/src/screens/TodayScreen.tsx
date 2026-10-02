import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS, SPACING } from '../constants/theme';
import { useApp } from '../store/AppContext';
import { Header } from '../components/Header';
import { ScoreBreakdownCard } from '../components/ScoreBreakdownCard';
import { PowerCard } from '../components/PowerCard';
import { HabitItemCard } from '../components/HabitItemCard';
import { EnergyCheckInModal } from '../components/EnergyCheckInModal';
import { EmergencyRoutineModal } from '../components/EmergencyRoutineModal';
import { ContractView } from '../components/ContractView';

export const TodayScreen: React.FC = () => {
  const { todayLog, habits, score, scoreBreakdown, updateHabitStatus } = useApp();

  const [showEnergyModal, setShowEnergyModal] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [showContractModal, setShowContractModal] = useState(false);

  const habitResults = todayLog?.habitResults || [];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Header onOpenContract={() => setShowContractModal(true)} />

        {/* Score Card */}
        <ScoreBreakdownCard score={score} breakdown={scoreBreakdown} />

        {/* Three Powers */}
        <PowerCard habitResults={habitResults} />

        {/* Action Triggers Bar */}
        <View style={styles.actionsBar}>
          <TouchableOpacity 
            style={styles.energyBtn} 
            onPress={() => setShowEnergyModal(true)}
          >
            <Text style={styles.energyBtnText}>⚡ ENERGY: {todayLog?.energy || 3}/5</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.emergencyBtn} 
            onPress={() => setShowEmergencyModal(true)}
          >
            <Text style={styles.emergencyBtnText}>⚠️ EMERGENCY PROTOCOL</Text>
          </TouchableOpacity>
        </View>

        {/* TODAY'S MISSION Section */}
        <View style={styles.missionHeaderRow}>
          <Text style={styles.missionTitle}>TODAY'S MISSION</Text>
          <Text style={styles.missionCount}>
            {habitResults.filter(r => r.status === 'TARGET_ACHIEVED' || r.status === 'STRETCH_ACHIEVED').length} / {habits.length} COMPLETED
          </Text>
        </View>

        {/* Task Cards */}
        {habits.map((habit) => {
          const result = habitResults.find(r => r.habitId === habit._id) || {
            habitId: habit._id,
            habitName: habit.name,
            powerId: habit.powerId,
            importance: habit.importance,
            minimumCompleted: false,
            targetCompleted: false,
            stretchCompleted: false,
            actualValue: 0,
            status: 'NOT_STARTED'
          };

          return (
            <HabitItemCard
              key={habit._id}
              habit={habit}
              result={result}
              onUpdateStatus={(status) => updateHabitStatus(habit._id, status)}
            />
          );
        })}

        {habits.length === 0 && (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>You haven't created your routine habits yet.</Text>
          </View>
        )}
      </ScrollView>

      {/* Modals */}
      <EnergyCheckInModal visible={showEnergyModal} onClose={() => setShowEnergyModal(false)} />
      <EmergencyRoutineModal visible={showEmergencyModal} onClose={() => setShowEmergencyModal(false)} />
      <ContractView visible={showContractModal} onClose={() => setShowContractModal(false)} />
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
  actionsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md
  },
  energyBtn: {
    flex: 1,
    backgroundColor: COLORS.secondarySurface,
    borderColor: COLORS.surfaceBorder,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginRight: 6
  },
  energyBtnText: {
    color: COLORS.iceAccent,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  emergencyBtn: {
    flex: 1,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: COLORS.danger,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginLeft: 6
  },
  emergencyBtnText: {
    color: COLORS.danger,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  missionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: SPACING.md,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm
  },
  missionTitle: {
    color: COLORS.secondaryText,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1
  },
  missionCount: {
    color: COLORS.iceAccent,
    fontSize: 10,
    fontWeight: '800'
  },
  emptyCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    marginHorizontal: SPACING.md,
    borderRadius: 12,
    alignItems: 'center'
  },
  emptyText: {
    color: COLORS.secondaryText,
    fontSize: 13
  }
});
