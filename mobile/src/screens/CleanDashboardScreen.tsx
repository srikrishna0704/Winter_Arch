import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal } from 'react-native';
import { COLORS, SPACING } from '../constants/theme';
import { apiRequest } from '../services/api';

interface GoalMilestone {
  id: string;
  title: string;
  completed: boolean;
}

interface Goal {
  _id: string;
  title: string;
  category: string;
  progress: number;
  targetDate: string;
  milestones: GoalMilestone[];
}

export const CleanDashboardScreen: React.FC = () => {
  // Sleep State
  const [bedtime, setBedtime] = useState('23:00');
  const [wakeTime, setWakeTime] = useState('06:30');
  const [sleepHours, setSleepHours] = useState(7.5);
  const [sleepQuality, setSleepQuality] = useState<'Restless' | 'Good' | 'Deep'>('Good');
  const [weeklySleep, setWeeklySleep] = useState([7.0, 7.5, 6.8, 8.0, 7.2, 7.5, 7.8]);

  // Goals State
  const [goals, setGoals] = useState<Goal[]>([
    {
      _id: 'g1',
      title: 'Become MERN Job Ready',
      category: 'Career & Tech',
      progress: 75,
      targetDate: 'Dec 30',
      milestones: [
        { id: 'm1', title: 'Master React Native & Expo UI', completed: true },
        { id: 'm2', title: 'Build Express REST API with MongoDB', completed: true },
        { id: 'm3', title: 'Deploy Fullstack App to Cloud', completed: false }
      ]
    },
    {
      _id: 'g2',
      title: 'Peak Athletic Fitness',
      category: 'Health & Body',
      progress: 60,
      targetDate: 'Nov 30',
      milestones: [
        { id: 'b1', title: 'Run 100km total distance', completed: true },
        { id: 'b2', title: '7.5 hours average sleep per night', completed: true },
        { id: 'b3', title: 'Zero missed workout days', completed: false }
      ]
    }
  ]);

  // Modal State for New Goal
  const [showAddGoalModal, setShowAddGoalModal] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalCategory, setNewGoalCategory] = useState('Personal');

  // Daily Habits checklist
  const [habits, setHabits] = useState([
    { id: 'h1', name: 'Deep Coding Session (2h)', completed: true, goal: 'Become MERN Job Ready' },
    { id: 'h2', name: 'Morning Workout & Stretch', completed: true, goal: 'Peak Athletic Fitness' },
    { id: 'h3', name: '7.5h Quality Sleep', completed: true, goal: 'Health & Body' }
  ]);

  // Recalculate sleep duration whenever bedtime or wakeTime changes
  const updateSleepTimes = (bed: string, wake: string) => {
    setBedtime(bed);
    setWakeTime(wake);
    const [bH, bM] = bed.split(':').map(Number);
    const [wH, wM] = wake.split(':').map(Number);
    let diff = (wH + wM / 60) - (bH + bM / 60);
    if (diff < 0) diff += 24;
    setSleepHours(parseFloat(diff.toFixed(1)));
  };

  const toggleMilestone = (goalId: string, milestoneId: string) => {
    setGoals(goals.map(g => {
      if (g._id === goalId) {
        const updatedMilestones = g.milestones.map(m => 
          m.id === milestoneId ? { ...m, completed: !m.completed } : m
        );
        const completedCount = updatedMilestones.filter(m => m.completed).length;
        const progress = Math.round((completedCount / updatedMilestones.length) * 100);
        return { ...g, milestones: updatedMilestones, progress };
      }
      return g;
    }));
  };

  const toggleHabit = (habitId: string) => {
    setHabits(habits.map(h => h.id === habitId ? { ...h, completed: !h.completed } : h));
  };

  const handleCreateGoal = () => {
    if (!newGoalTitle.trim()) return;
    const newG: Goal = {
      _id: 'g_' + Date.now(),
      title: newGoalTitle,
      category: newGoalCategory,
      progress: 0,
      targetDate: '90 Days',
      milestones: [
        { id: 'm_' + Date.now() + '_1', title: 'Phase 1: Setup & Foundation', completed: false },
        { id: 'm_' + Date.now() + '_2', title: 'Phase 2: Core Execution', completed: false }
      ]
    };
    setGoals([...goals, newG]);
    setNewGoalTitle('');
    setShowAddGoalModal(false);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Top Minimal Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.appTitle}>WINTER ARC</Text>
            <Text style={styles.appSub}>GOALS & SLEEP TRACKER</Text>
          </View>
          <View style={styles.streakPill}>
            <Text style={styles.streakText}>🔥 17 DAY STREAK</Text>
          </View>
        </View>

        {/* 1. SLEEP TRACKER CARD */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>🌙 SLEEP TRACKER</Text>
            <Text style={styles.sleepValHighlight}>{sleepHours} hrs logged</Text>
          </View>

          {/* Bedtime / Wake Input Row */}
          <View style={styles.sleepRow}>
            <View style={styles.timeBox}>
              <Text style={styles.timeLabel}>BEDTIME</Text>
              <TextInput
                style={styles.timeInput}
                value={bedtime}
                onChangeText={(val) => updateSleepTimes(val, wakeTime)}
                placeholder="23:00"
                placeholderTextColor={COLORS.mutedText}
              />
            </View>

            <View style={styles.timeDivider}>
              <Text style={styles.dividerArrow}>→</Text>
            </View>

            <View style={styles.timeBox}>
              <Text style={styles.timeLabel}>WAKE TIME</Text>
              <TextInput
                style={styles.timeInput}
                value={wakeTime}
                onChangeText={(val) => updateSleepTimes(bedtime, val)}
                placeholder="06:30"
                placeholderTextColor={COLORS.mutedText}
              />
            </View>
          </View>

          {/* Sleep Quality Buttons */}
          <Text style={styles.sectionLabel}>SLEEP QUALITY</Text>
          <View style={styles.qualityRow}>
            {(['Restless', 'Good', 'Deep'] as const).map((q) => (
              <TouchableOpacity
                key={q}
                style={[styles.qualityBtn, sleepQuality === q && styles.qualityBtnActive]}
                onPress={() => setSleepQuality(q)}
              >
                <Text style={[styles.qualityText, sleepQuality === q && styles.qualityTextActive]}>
                  {q === 'Restless' ? '😴 Restless' : q === 'Good' ? '🙂 Good' : '🔥 Deep'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Weekly Sleep Mini Chart */}
          <Text style={styles.sectionLabel}>PAST 7 DAYS SLEEP (HRS)</Text>
          <View style={styles.chartContainer}>
            {weeklySleep.map((val, idx) => {
              const heightPct = (val / 9) * 100;
              const isToday = idx === 6;
              return (
                <View key={idx} style={styles.barCol}>
                  <Text style={styles.barVal}>{val}</Text>
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { height: `${heightPct}%` }, isToday && styles.barFillToday]} />
                  </View>
                  <Text style={styles.barLabel}>{['M', 'T', 'W', 'T', 'F', 'S', 'S'][idx]}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* 2. GOALS SECTION */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>🎯 GOAL PROGRESS</Text>
          <TouchableOpacity style={styles.addGoalBtn} onPress={() => setShowAddGoalModal(true)}>
            <Text style={styles.addGoalText}>+ NEW GOAL</Text>
          </TouchableOpacity>
        </View>

        {goals.map((goal) => (
          <View key={goal._id} style={styles.card}>
            <View style={styles.goalTopRow}>
              <View style={styles.goalTitleCol}>
                <Text style={styles.categoryTag}>{goal.category.toUpperCase()}</Text>
                <Text style={styles.goalTitle}>{goal.title}</Text>
              </View>

              <View style={styles.progressCircle}>
                <Text style={styles.progressPctText}>{goal.progress}%</Text>
              </View>
            </View>

            {/* Sleek Progress Bar */}
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${goal.progress}%` }]} />
            </View>

            {/* Interactive Milestones Checklist */}
            <View style={styles.milestoneContainer}>
              {goal.milestones.map((m) => (
                <TouchableOpacity
                  key={m.id}
                  style={styles.milestoneRow}
                  onPress={() => toggleMilestone(goal._id, m.id)}
                >
                  <View style={[styles.checkbox, m.completed && styles.checkboxChecked]}>
                    {m.completed && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <Text style={[styles.milestoneText, m.completed && styles.milestoneTextDone]}>
                    {m.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* 3. TODAY'S GOAL-ALIGNED HABITS */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>⚡ TODAY'S GOAL HABITS</Text>
          <View style={styles.habitsList}>
            {habits.map((h) => (
              <TouchableOpacity
                key={h.id}
                style={styles.habitRow}
                onPress={() => toggleHabit(h.id)}
              >
                <View style={[styles.checkbox, h.completed && styles.checkboxChecked]}>
                  {h.completed && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <View style={styles.habitCol}>
                  <Text style={[styles.habitName, h.completed && styles.habitDone]}>{h.name}</Text>
                  <Text style={styles.habitGoalTag}>Goal: {h.goal}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

      </ScrollView>

      {/* Add Goal Modal */}
      {showAddGoalModal && (
        <Modal visible={true} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>CREATE NEW GOAL</Text>

              <Text style={styles.modalLabel}>GOAL TITLE</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. Master React Native & Cloud APIs"
                placeholderTextColor={COLORS.mutedText}
                value={newGoalTitle}
                onChangeText={setNewGoalTitle}
              />

              <Text style={styles.modalLabel}>CATEGORY</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. Career / Fitness / Learning"
                placeholderTextColor={COLORS.mutedText}
                value={newGoalCategory}
                onChangeText={setNewGoalCategory}
              />

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.modalSaveBtn} onPress={handleCreateGoal}>
                  <Text style={styles.modalSaveText}>SAVE GOAL</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowAddGoalModal(false)}>
                  <Text style={styles.modalCancelText}>CANCEL</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090A0C'
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
    paddingTop: SPACING.sm
  },
  appTitle: {
    color: '#F5F5F5',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5
  },
  appSub: {
    color: '#8BCEFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginTop: 2
  },
  streakPill: {
    backgroundColor: '#181B21',
    borderColor: 'rgba(139, 206, 255, 0.3)',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20
  },
  streakText: {
    color: '#8BCEFF',
    fontSize: 11,
    fontWeight: '800'
  },
  card: {
    backgroundColor: '#111318',
    borderColor: '#232730',
    borderWidth: 1,
    borderRadius: 14,
    padding: SPACING.md,
    marginBottom: SPACING.md
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md
  },
  cardTitle: {
    color: '#F5F5F5',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  sleepValHighlight: {
    color: '#22C55E',
    fontSize: 13,
    fontWeight: '800'
  },
  sleepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#181B21',
    borderRadius: 10,
    padding: SPACING.sm,
    marginBottom: SPACING.md
  },
  timeBox: {
    flex: 1,
    alignItems: 'center'
  },
  timeLabel: {
    color: '#9CA3AF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 2
  },
  timeInput: {
    color: '#F5F5F5',
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    paddingVertical: 4
  },
  timeDivider: {
    paddingHorizontal: 8
  },
  dividerArrow: {
    color: '#8BCEFF',
    fontSize: 16,
    fontWeight: '800'
  },
  sectionLabel: {
    color: '#6B7280',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: SPACING.xs
  },
  qualityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md
  },
  qualityBtn: {
    flex: 1,
    backgroundColor: '#181B21',
    borderColor: '#232730',
    borderWidth: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 3
  },
  qualityBtnActive: {
    backgroundColor: 'rgba(139, 206, 255, 0.15)',
    borderColor: '#8BCEFF'
  },
  qualityText: {
    color: '#9CA3AF',
    fontSize: 11,
    fontWeight: '700'
  },
  qualityTextActive: {
    color: '#8BCEFF',
    fontWeight: '800'
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 80,
    marginTop: 6,
    paddingTop: 8
  },
  barCol: {
    flex: 1,
    alignItems: 'center',
    height: '100%'
  },
  barVal: {
    color: '#9CA3AF',
    fontSize: 9,
    fontWeight: '700',
    marginBottom: 4
  },
  barTrack: {
    flex: 1,
    width: 14,
    backgroundColor: '#181B21',
    borderRadius: 7,
    justifyContent: 'flex-end',
    overflow: 'hidden'
  },
  barFill: {
    backgroundColor: '#374151',
    borderRadius: 7
  },
  barFillToday: {
    backgroundColor: '#22C55E'
  },
  barLabel: {
    color: '#6B7280',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 4
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    marginTop: SPACING.xs
  },
  sectionTitle: {
    color: '#F5F5F5',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  addGoalBtn: {
    backgroundColor: '#181B21',
    borderColor: '#8BCEFF',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6
  },
  addGoalText: {
    color: '#8BCEFF',
    fontSize: 10,
    fontWeight: '800'
  },
  goalTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs
  },
  goalTitleCol: {
    flex: 1,
    marginRight: 8
  },
  categoryTag: {
    color: '#8BCEFF',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1
  },
  goalTitle: {
    color: '#F5F5F5',
    fontSize: 16,
    fontWeight: '800',
    marginTop: 2
  },
  progressCircle: {
    backgroundColor: '#181B21',
    borderColor: '#22C55E',
    borderWidth: 1.5,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center'
  },
  progressPctText: {
    color: '#22C55E',
    fontSize: 12,
    fontWeight: '900'
  },
  progressTrack: {
    height: 6,
    backgroundColor: '#181B21',
    borderRadius: 3,
    overflow: 'hidden',
    marginVertical: SPACING.sm
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#22C55E',
    borderRadius: 3
  },
  milestoneContainer: {
    gap: 6,
    marginTop: 4
  },
  milestoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#181B21',
    padding: 8,
    borderRadius: 6
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#6B7280',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10
  },
  checkboxChecked: {
    backgroundColor: '#22C55E',
    borderColor: '#22C55E'
  },
  checkmark: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '900'
  },
  milestoneText: {
    color: '#F5F5F5',
    fontSize: 12,
    fontWeight: '600'
  },
  milestoneTextDone: {
    color: '#6B7280',
    textDecorationLine: 'line-through'
  },
  habitsList: {
    gap: 8,
    marginTop: SPACING.xs
  },
  habitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#181B21',
    padding: SPACING.sm,
    borderRadius: 8
  },
  habitCol: {
    flex: 1
  },
  habitName: {
    color: '#F5F5F5',
    fontSize: 13,
    fontWeight: '700'
  },
  habitDone: {
    color: '#6B7280',
    textDecorationLine: 'line-through'
  },
  habitGoalTag: {
    color: '#9CA3AF',
    fontSize: 10,
    marginTop: 2
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
    maxWidth: 400,
    backgroundColor: '#111318',
    borderColor: '#232730',
    borderWidth: 1,
    borderRadius: 16,
    padding: SPACING.lg
  },
  modalTitle: {
    color: '#F5F5F5',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.5,
    marginBottom: SPACING.md
  },
  modalLabel: {
    color: '#6B7280',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 4
  },
  modalInput: {
    backgroundColor: '#181B21',
    borderColor: '#232730',
    borderWidth: 1,
    borderRadius: 8,
    padding: SPACING.sm,
    color: '#F5F5F5',
    fontSize: 13,
    marginBottom: SPACING.md
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: SPACING.xs
  },
  modalSaveBtn: {
    backgroundColor: '#8BCEFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8
  },
  modalSaveText: {
    color: '#000',
    fontSize: 11,
    fontWeight: '900'
  },
  modalCancelBtn: {
    backgroundColor: '#181B21',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8
  },
  modalCancelText: {
    color: '#9CA3AF',
    fontSize: 11,
    fontWeight: '700'
  }
});
