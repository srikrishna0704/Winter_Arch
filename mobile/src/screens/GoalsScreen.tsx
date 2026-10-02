import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { COLORS, SPACING } from '../constants/theme';
import { useApp } from '../store/AppContext';

export const GoalsScreen: React.FC = () => {
  const { goals, saveGoal, toggleMilestone } = useApp();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const handleCreate = async () => {
    if (!newTitle) return;
    await saveGoal({
      title: newTitle,
      description: newDesc,
      powerId: 'future',
      target: '100%',
      progress: 0,
      milestones: [
        { id: 'm1', title: 'Phase 1 Research & Foundation', completed: false },
        { id: 'm2', title: 'Phase 2 Execution & Deep Work', completed: false },
        { id: 'm3', title: 'Phase 3 Verification & Deployment', completed: false }
      ]
    });
    setNewTitle('');
    setNewDesc('');
    setShowAddForm(false);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>GOALS HIERARCHY</Text>
          <Text style={styles.subtitle}>90-Day Vision → Milestones → Daily Habits</Text>
        </View>

        {/* Goals List */}
        <View style={styles.goalsContainer}>
          {goals.map((goal) => (
            <View key={goal._id} style={styles.goalCard}>
              <View style={styles.goalHeader}>
                <View style={styles.goalTitleCol}>
                  <Text style={styles.goalPowerTag}>{(goal.powerId || 'FUTURE').toUpperCase()}</Text>
                  <Text style={styles.goalTitle}>{goal.title}</Text>
                </View>

                <View style={styles.pctBadge}>
                  <Text style={styles.pctText}>{goal.progress}%</Text>
                </View>
              </View>

              {goal.description ? (
                <Text style={styles.goalDesc}>{goal.description}</Text>
              ) : null}

              {/* Progress Bar */}
              <View style={styles.track}>
                <View style={[styles.fill, { width: `${goal.progress}%` }]} />
              </View>

              {/* Milestones Hierarchy */}
              <Text style={styles.milestonesHeader}>MONTHLY MILESTONES & TARGETS:</Text>
              <View style={styles.milestonesList}>
                {(goal.milestones || []).map((m) => (
                  <TouchableOpacity
                    key={m.id}
                    style={styles.milestoneRow}
                    onPress={() => toggleMilestone(goal._id, m.id)}
                  >
                    <View style={[styles.checkbox, m.completed && styles.checkboxChecked]}>
                      {m.completed && <Text style={styles.checkMark}>✓</Text>}
                    </View>
                    <Text style={[styles.milestoneText, m.completed && styles.milestoneDone]}>
                      {m.title}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}

          {/* Add Goal Button / Form */}
          {!showAddForm ? (
            <TouchableOpacity style={styles.addBtn} onPress={() => setShowAddForm(true)}>
              <Text style={styles.addBtnText}>+ CREATE NEW 90-DAY GOAL</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>NEW 90-DAY GOAL</Text>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>GOAL TITLE</Text>
                <TextInput 
                  style={styles.input} 
                  placeholder="e.g. Master Backend Engineering" 
                  placeholderTextColor={COLORS.mutedText}
                  value={newTitle}
                  onChangeText={setNewTitle}
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>DESCRIPTION</Text>
                <TextInput 
                  style={styles.input} 
                  placeholder="Describe expected outcome..."
                  placeholderTextColor={COLORS.mutedText}
                  value={newDesc}
                  onChangeText={setNewDesc}
                />
              </View>

              <View style={styles.formActions}>
                <TouchableOpacity style={styles.submitBtn} onPress={handleCreate}>
                  <Text style={styles.submitBtnText}>SAVE GOAL</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowAddForm(false)}>
                  <Text style={styles.cancelBtnText}>CANCEL</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
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
  goalsContainer: {
    padding: SPACING.md,
    gap: SPACING.md
  },
  goalCard: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.surfaceBorder,
    borderWidth: 1,
    borderRadius: 12,
    padding: SPACING.md
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  goalTitleCol: {
    flex: 1,
    marginRight: 8
  },
  goalPowerTag: {
    color: COLORS.future,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1
  },
  goalTitle: {
    color: COLORS.primaryText,
    fontSize: 16,
    fontWeight: '700',
    marginTop: 2
  },
  pctBadge: {
    backgroundColor: COLORS.secondarySurface,
    borderWidth: 1,
    borderColor: COLORS.iceAccent,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  pctText: {
    color: COLORS.iceAccent,
    fontSize: 12,
    fontWeight: '800'
  },
  goalDesc: {
    color: COLORS.secondaryText,
    fontSize: 12,
    marginVertical: 8,
    lineHeight: 18
  },
  track: {
    height: 6,
    backgroundColor: COLORS.secondarySurface,
    borderRadius: 3,
    overflow: 'hidden',
    marginVertical: 8
  },
  fill: {
    height: '100%',
    backgroundColor: COLORS.iceAccent,
    borderRadius: 3
  },
  milestonesHeader: {
    color: COLORS.mutedText,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginTop: 8,
    marginBottom: 6
  },
  milestonesList: {
    gap: 6
  },
  milestoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondarySurface,
    padding: 8,
    borderRadius: 6
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.secondaryText,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8
  },
  checkboxChecked: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success
  },
  checkMark: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '900'
  },
  milestoneText: {
    color: COLORS.primaryText,
    fontSize: 12,
    fontWeight: '600'
  },
  milestoneDone: {
    textDecorationLine: 'line-through',
    color: COLORS.mutedText
  },
  addBtn: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.iceAccent,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: SPACING.md,
    alignItems: 'center'
  },
  addBtnText: {
    color: COLORS.iceAccent,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1
  },
  formCard: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.surfaceBorder,
    borderWidth: 1,
    borderRadius: 12,
    padding: SPACING.md
  },
  formTitle: {
    color: COLORS.primaryText,
    fontSize: 14,
    fontWeight: '800',
    marginBottom: SPACING.md
  },
  fieldGroup: {
    marginBottom: SPACING.sm
  },
  label: {
    color: COLORS.mutedText,
    fontSize: 9,
    fontWeight: '800',
    marginBottom: 4
  },
  input: {
    backgroundColor: COLORS.secondarySurface,
    borderColor: COLORS.surfaceBorder,
    borderWidth: 1,
    borderRadius: 6,
    padding: 8,
    color: COLORS.primaryText,
    fontSize: 12
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: SPACING.md,
    gap: 8
  },
  submitBtn: {
    backgroundColor: COLORS.iceAccent,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6
  },
  submitBtnText: {
    color: '#000',
    fontSize: 11,
    fontWeight: '800'
  },
  cancelBtn: {
    backgroundColor: COLORS.secondarySurface,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6
  },
  cancelBtnText: {
    color: COLORS.secondaryText,
    fontSize: 11,
    fontWeight: '700'
  }
});
