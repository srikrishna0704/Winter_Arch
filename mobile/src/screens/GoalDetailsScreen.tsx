import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { COLORS, SPACING } from '../constants/theme';

export interface GoalStep {
  id: string;
  text: string;
  completed: boolean;
}

export interface GoalData {
  title: string;
  description: string;
  strategy: string;
  targetDate: string;
  category: string;
  steps: GoalStep[];
}

interface Props {
  habitNumber: number;
  monthName: string;
  year: number;
  goalData: GoalData;
  onSave: (updated: GoalData) => void;
  onBack: () => void;
}

export const GoalDetailsScreen: React.FC<Props> = ({ habitNumber, monthName, year, goalData, onSave, onBack }) => {
  const [title, setTitle] = useState(goalData.title || `Habit Goal #${habitNumber}`);
  const [description, setDescription] = useState(goalData.description || '');
  const [strategy, setStrategy] = useState(
    goalData.strategy || 'Execute unbroken focus blocks daily. Track daily consistency.'
  );
  const [targetDate, setTargetDate] = useState(goalData.targetDate || `30 ${monthName} ${year}`);
  const [category, setCategory] = useState(goalData.category || 'Personal Goal');
  const [steps, setSteps] = useState<GoalStep[]>(
    goalData.steps && goalData.steps.length > 0
      ? goalData.steps
      : [
          { id: 's1', text: 'Step 1: Define baseline daily target', completed: true },
          { id: 's2', text: 'Step 2: Build 14-day unbroken execution streak', completed: true },
          { id: 's3', text: 'Step 3: Review & scale target workload', completed: false }
        ]
  );

  const [newStepText, setNewStepText] = useState('');

  const toggleStep = (id: string) => {
    setSteps(steps.map(s => s.id === id ? { ...s, completed: !s.completed } : s));
  };

  const addStep = () => {
    if (!newStepText.trim()) return;
    setSteps([...steps, { id: 's_' + Date.now(), text: newStepText.trim(), completed: false }]);
    setNewStepText('');
  };

  const deleteStep = (id: string) => {
    setSteps(steps.filter(s => s.id !== id));
  };

  const handleSave = () => {
    const updated: GoalData = {
      title,
      description,
      strategy,
      targetDate,
      category,
      steps
    };
    onSave(updated);
    onBack();
  };

  const completedCount = steps.filter(s => s.completed).length;
  const progressPct = steps.length > 0 ? Math.round((completedCount / steps.length) * 100) : 0;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={true}>
        {/* Navigation Bar */}
        <View style={styles.topNavRow}>
          <TouchableOpacity style={styles.backBtn} onPress={onBack}>
            <Text style={styles.backBtnText}>← BACK TO TRACKER SHEET</Text>
          </TouchableOpacity>
          <Text style={styles.monthBadge}>HABIT #{habitNumber} • {monthName.toUpperCase()} {year}</Text>
        </View>

        {/* Page Title */}
        <View style={styles.headerBox}>
          <Text style={styles.pageTitle}>DETAILED GOAL PLAN: {title.toUpperCase()}</Text>
          <Text style={styles.pageSub}>
            Specific breakdown, execution roadmap, strategy, and milestones for Habit Goal #{habitNumber}.
          </Text>
        </View>

        {/* Goal Overview Card */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.cardLabel}>HABIT GOAL #{habitNumber} TITLE & VISION</Text>
            <View style={styles.pctTag}>
              <Text style={styles.pctTagText}>{progressPct}% MILESTONES DONE</Text>
            </View>
          </View>

          <TextInput
            style={styles.titleInput}
            value={title}
            onChangeText={setTitle}
            placeholder={`Habit #${habitNumber} Goal Title...`}
            placeholderTextColor={COLORS.mutedText}
          />

          {/* Progress Bar */}
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${progressPct}%` }]} />
          </View>

          <View style={styles.rowTwoCol}>
            <View style={styles.halfCol}>
              <Text style={styles.fieldLabel}>CATEGORY</Text>
              <TextInput
                style={styles.smallInput}
                value={category}
                onChangeText={setCategory}
                placeholder="Skill / Health / Career"
                placeholderTextColor={COLORS.mutedText}
              />
            </View>

            <View style={styles.halfCol}>
              <Text style={styles.fieldLabel}>TARGET DEADLINE</Text>
              <TextInput
                style={styles.smallInput}
                value={targetDate}
                onChangeText={setTargetDate}
                placeholder="DD / MM / YYYY"
                placeholderTextColor={COLORS.mutedText}
              />
            </View>
          </View>

          <Text style={styles.fieldLabel}>VISION & DESCRIPTION</Text>
          <TextInput
            style={[styles.areaInput, { height: 60 }]}
            multiline
            value={description}
            onChangeText={setDescription}
            placeholder="Detailed description of what you want to achieve with this specific habit..."
            placeholderTextColor={COLORS.mutedText}
          />
        </View>

        {/* Routine & Strategy Card */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>EXECUTION STRATEGY & ROUTINE NON-NEGOTIABLES</Text>
          <TextInput
            style={[styles.areaInput, { height: 80 }]}
            multiline
            value={strategy}
            onChangeText={setStrategy}
            placeholder="Specify time window, daily targets, and rules to prevent zero days..."
            placeholderTextColor={COLORS.mutedText}
          />
        </View>

        {/* Actionable Milestones List */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.cardLabel}>ACTIONABLE STEPS & MILESTONES ({completedCount}/{steps.length})</Text>
          </View>

          <View style={styles.stepsList}>
            {steps.map((s) => (
              <View key={s.id} style={styles.stepItemRow}>
                <TouchableOpacity
                  style={styles.stepCheckArea}
                  onPress={() => toggleStep(s.id)}
                >
                  <View style={[styles.checkbox, s.completed && styles.checkboxChecked]}>
                    {s.completed && <Text style={styles.checkMarkText}>✓</Text>}
                  </View>
                  <Text style={[styles.stepText, s.completed && styles.stepTextDone]}>
                    {s.text}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.delBtn} onPress={() => deleteStep(s.id)}>
                  <Text style={styles.delBtnText}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>

          {/* Add Step */}
          <View style={styles.addStepRow}>
            <TextInput
              style={styles.addStepInput}
              value={newStepText}
              onChangeText={setNewStepText}
              placeholder="Add a new milestone step for this goal..."
              placeholderTextColor={COLORS.mutedText}
              onSubmitEditing={addStep}
            />
            <TouchableOpacity style={styles.addStepBtn} onPress={addStep}>
              <Text style={styles.addStepBtnText}>+ ADD STEP</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom Save Action */}
        <View style={styles.bottomActionRow}>
          <TouchableOpacity style={styles.saveActionBtn} onPress={handleSave}>
            <Text style={styles.saveActionText}>💾 SAVE GOAL DETAILS & RETURN TO TRACKER</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000'
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: 140
  },
  topNavRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md
  },
  backBtn: {
    backgroundColor: '#181B21',
    borderColor: '#8BCEFF',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8
  },
  backBtnText: {
    color: '#8BCEFF',
    fontSize: 11,
    fontWeight: '800'
  },
  monthBadge: {
    color: '#22C55E',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1
  },
  headerBox: {
    backgroundColor: '#111318',
    borderColor: '#232730',
    borderWidth: 1,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md
  },
  pageTitle: {
    color: '#F5F5F5',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1
  },
  pageSub: {
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 4
  },
  card: {
    backgroundColor: '#111318',
    borderColor: '#232730',
    borderWidth: 1,
    borderRadius: 14,
    padding: SPACING.md,
    marginBottom: SPACING.md
  },
  cardTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs
  },
  cardLabel: {
    color: '#8BCEFF',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1
  },
  pctTag: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4
  },
  pctTagText: {
    color: '#22C55E',
    fontSize: 10,
    fontWeight: '900'
  },
  titleInput: {
    color: '#F5F5F5',
    fontSize: 18,
    fontWeight: '800',
    backgroundColor: '#181B21',
    borderColor: '#232730',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginVertical: SPACING.xs
  },
  track: {
    height: 6,
    backgroundColor: '#181B21',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: SPACING.md
  },
  fill: {
    height: '100%',
    backgroundColor: '#22C55E',
    borderRadius: 3
  },
  rowTwoCol: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: SPACING.sm
  },
  halfCol: {
    flex: 1
  },
  fieldLabel: {
    color: '#6B7280',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 4,
    marginTop: 4
  },
  smallInput: {
    backgroundColor: '#181B21',
    borderColor: '#232730',
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    color: '#F5F5F5',
    fontSize: 12
  },
  areaInput: {
    backgroundColor: '#181B21',
    borderColor: '#232730',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    color: '#F5F5F5',
    fontSize: 12,
    lineHeight: 18,
    textAlignVertical: 'top'
  },
  stepsList: {
    gap: 6,
    marginVertical: SPACING.xs
  },
  stepItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#181B21',
    padding: 10,
    borderRadius: 8
  },
  stepCheckArea: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8
  },
  checkbox: {
    width: 20,
    height: 20,
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
  checkMarkText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '900'
  },
  stepText: {
    color: '#F5F5F5',
    fontSize: 13,
    fontWeight: '600'
  },
  stepTextDone: {
    color: '#6B7280',
    textDecorationLine: 'line-through'
  },
  delBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4
  },
  delBtnText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '800'
  },
  addStepRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: SPACING.sm
  },
  addStepInput: {
    flex: 1,
    backgroundColor: '#181B21',
    borderColor: '#232730',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    color: '#F5F5F5',
    fontSize: 12
  },
  addStepBtn: {
    backgroundColor: '#181B21',
    borderColor: '#8BCEFF',
    borderWidth: 1,
    paddingHorizontal: 14,
    justifyContent: 'center',
    borderRadius: 8
  },
  addStepBtnText: {
    color: '#8BCEFF',
    fontSize: 10,
    fontWeight: '900'
  },
  bottomActionRow: {
    marginTop: SPACING.md
  },
  saveActionBtn: {
    backgroundColor: '#8BCEFF',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center'
  },
  saveActionText: {
    color: '#000',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1
  }
});
