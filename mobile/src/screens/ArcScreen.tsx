import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS, SPACING } from '../constants/theme';
import { useApp } from '../store/AppContext';
import { ContractView } from '../components/ContractView';

export const ArcScreen: React.FC = () => {
  const { user, arc, isDemoMode, toggleDemoMode, logout } = useApp();
  const [showContract, setShowContract] = useState(false);

  const currentDay = arc ? arc.currentDay : 17;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>ARC PROFILE & SETTINGS</Text>
          <Text style={styles.subtitle}>Operating System Configuration & Contract</Text>
        </View>

        {/* User Card */}
        <View style={styles.card}>
          <Text style={styles.userName}>{user?.name || 'Alex Vance'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'alex@winterarc.com'}</Text>

          <View style={styles.phaseRow}>
            <View style={styles.phaseCol}>
              <Text style={styles.phaseLabel}>CURRENT DAY</Text>
              <Text style={styles.phaseVal}>DAY {currentDay} / 90</Text>
            </View>
            <View style={styles.phaseCol}>
              <Text style={styles.phaseLabel}>ACTIVE PHASE</Text>
              <Text style={styles.phaseVal}>{arc?.phase || 'Foundation'}</Text>
            </View>
          </View>
        </View>

        {/* Winter Arc Contract Entry */}
        <TouchableOpacity style={styles.contractBtn} onPress={() => setShowContract(true)}>
          <View>
            <Text style={styles.contractBtnTag}>OFFICIAL DOCUMENT</Text>
            <Text style={styles.contractBtnTitle}>View Winter Arc Contract</Text>
          </View>
          <Text style={styles.contractArrow}>→</Text>
        </TouchableOpacity>

        {/* Phase Breakdown */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>90-DAY PHASE STRUCTURE</Text>

          <View style={[styles.phaseBox, currentDay <= 30 && styles.activePhaseBox]}>
            <Text style={styles.phaseBoxName}>PHASE 1: FOUNDATION (DAYS 1–30)</Text>
            <Text style={styles.phaseBoxDesc}>Build consistency & establish non-negotiable minimum routines.</Text>
          </View>

          <View style={[styles.phaseBox, currentDay > 30 && currentDay <= 60 && styles.activePhaseBox]}>
            <Text style={styles.phaseBoxName}>PHASE 2: DISCIPLINE (DAYS 31–60)</Text>
            <Text style={styles.phaseBoxDesc}>Increase workload, eliminate friction, reduce excuses.</Text>
          </View>

          <View style={[styles.phaseBox, currentDay > 60 && styles.activePhaseBox]}>
            <Text style={styles.phaseBoxName}>PHASE 3: TRANSFORMATION (DAYS 61–90)</Text>
            <Text style={styles.phaseBoxDesc}>Execute at maximum capacity & peak performance level.</Text>
          </View>
        </View>

        {/* Settings & Demo Mode */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>SYSTEM SETTINGS</Text>

          <TouchableOpacity style={styles.settingRow} onPress={() => toggleDemoMode()}>
            <View>
              <Text style={styles.settingText}>Demo Mode (Alex Vance Sample)</Text>
              <Text style={styles.settingSub}>Explore full 30-day log history & analytics</Text>
            </View>
            <Text style={styles.toggleStatus}>{isDemoMode ? 'ON' : 'OFF'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingRow} onPress={logout}>
            <Text style={[styles.settingText, { color: COLORS.danger }]}>Sign Out / Reset Session</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Contract View Modal */}
      <ContractView visible={showContract} onClose={() => setShowContract(false)} />
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
  card: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.surfaceBorder,
    borderWidth: 1,
    borderRadius: 12,
    padding: SPACING.md,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md
  },
  userName: {
    color: COLORS.primaryText,
    fontSize: 18,
    fontWeight: '800'
  },
  userEmail: {
    color: COLORS.secondaryText,
    fontSize: 12,
    marginTop: 2
  },
  phaseRow: {
    flexDirection: 'row',
    marginTop: SPACING.md,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceBorder
  },
  phaseCol: {
    flex: 1
  },
  phaseLabel: {
    color: COLORS.mutedText,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1
  },
  phaseVal: {
    color: COLORS.iceAccent,
    fontSize: 14,
    fontWeight: '800',
    marginTop: 2
  },
  contractBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.secondarySurface,
    borderColor: COLORS.iceAccent,
    borderWidth: 1,
    borderRadius: 12,
    padding: SPACING.md,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md
  },
  contractBtnTag: {
    color: COLORS.iceAccent,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1
  },
  contractBtnTitle: {
    color: COLORS.primaryText,
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2
  },
  contractArrow: {
    color: COLORS.iceAccent,
    fontSize: 18,
    fontWeight: '800'
  },
  cardTitle: {
    color: COLORS.secondaryText,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: SPACING.sm
  },
  phaseBox: {
    backgroundColor: COLORS.secondarySurface,
    borderRadius: 8,
    padding: SPACING.sm,
    marginBottom: SPACING.xs,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.surfaceBorder
  },
  activePhaseBox: {
    borderLeftColor: COLORS.iceAccent,
    backgroundColor: 'rgba(139, 206, 255, 0.08)'
  },
  phaseBoxName: {
    color: COLORS.primaryText,
    fontSize: 12,
    fontWeight: '800'
  },
  phaseBoxDesc: {
    color: COLORS.secondaryText,
    fontSize: 11,
    marginTop: 2
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceBorder
  },
  settingText: {
    color: COLORS.primaryText,
    fontSize: 13,
    fontWeight: '600'
  },
  settingSub: {
    color: COLORS.secondaryText,
    fontSize: 11,
    marginTop: 2
  },
  toggleStatus: {
    color: COLORS.iceAccent,
    fontSize: 12,
    fontWeight: '800'
  }
});
