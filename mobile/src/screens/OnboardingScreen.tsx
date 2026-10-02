import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { COLORS, SPACING } from '../constants/theme';
import { useApp } from '../store/AppContext';

interface Props {
  onComplete: () => void;
}

export const OnboardingScreen: React.FC<Props> = ({ onComplete }) => {
  const { createWinterArc } = useApp();
  const [step, setStep] = useState(1);

  // Form State
  const [mindPower, setMindPower] = useState('Mind');
  const [bodyPower, setBodyPower] = useState('Body');
  const [futurePower, setFuturePower] = useState('Future');

  const [mainGoal, setMainGoal] = useState('Become MERN Job Ready & Peak Physical Discipline');
  const [reason, setReason] = useState('Build unshakeable consistency and eliminate zero days.');

  const [habit1Name, setHabit1Name] = useState('Deep Coding Session');
  const [habit1Min, setHabit1Min] = useState('30m');
  const [habit1Target, setHabit1Target] = useState('2h');
  const [habit1Stretch, setHabit1Stretch] = useState('4h');

  const [habit2Name, setHabit2Name] = useState('Strength Workout');
  const [habit2Min, setHabit2Min] = useState('15m');
  const [habit2Target, setHabit2Target] = useState('45m');
  const [habit2Stretch, setHabit2Stretch] = useState('90m');

  const [sleepTarget, setSleepTarget] = useState('7h 30m');
  const [bedtime, setBedtime] = useState('23:00');
  const [wakeTime, setWakeTime] = useState('06:30');

  const [signature, setSignature] = useState('Alex Vance');

  const handleFinish = async () => {
    const powers = [
      { id: 'mind', name: mindPower, icon: 'brain', color: '#8BCEFF' },
      { id: 'body', name: bodyPower, icon: 'activity', color: '#22C55E' },
      { id: 'future', name: futurePower, icon: 'zap', color: '#F59E0B' }
    ];

    const habits = [
      {
        name: habit1Name,
        powerId: 'future',
        minimum: habit1Min,
        target: habit1Target,
        stretch: habit1Stretch,
        importance: 'non-negotiable',
        preferredTime: '09:00'
      },
      {
        name: habit2Name,
        powerId: 'body',
        minimum: habit2Min,
        target: habit2Target,
        stretch: habit2Stretch,
        importance: 'non-negotiable',
        preferredTime: '07:00'
      }
    ];

    await createWinterArc({
      powers,
      mainGoal,
      reason,
      signature,
      habits,
      sleepTarget: { duration: sleepTarget, bedtime, wakeTime }
    });

    onComplete();
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Step 1: Welcome */}
        {step === 1 && (
          <View style={styles.stepContainer}>
            <Text style={styles.tagline}>90 DAYS. ONE VERSION OF YOU.</Text>
            <Text style={styles.heroTitle}>WINTER ARC</Text>
            <Text style={styles.bodyText}>
              A 90-day personal discipline and self-improvement operating system.
            </Text>

            <TouchableOpacity style={styles.primaryBtn} onPress={() => setStep(2)}>
              <Text style={styles.primaryBtnText}>START MY ARC →</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Step 2: Philosophy */}
        {step === 2 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepHeader}>THE PHILOSOPHY</Text>
            <Text style={styles.quoteText}>
              "This isn't a challenge to become perfect. It's a system to become consistent."
            </Text>
            <Text style={styles.bodyText}>
              We eliminate zero days with Minimum targets, Target goals, and Stretch benchmarks.
            </Text>

            <TouchableOpacity style={styles.primaryBtn} onPress={() => setStep(3)}>
              <Text style={styles.primaryBtnText}>CONTINUE →</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Step 3: Three Powers */}
        {step === 3 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepHeader}>STEP 1 / 6: THREE POWERS</Text>
            <Text style={styles.instruction}>Define your 3 core pillars for transformation.</Text>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>POWER 1 (MIND)</Text>
              <TextInput style={styles.input} value={mindPower} onChangeText={setMindPower} />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>POWER 2 (BODY)</Text>
              <TextInput style={styles.input} value={bodyPower} onChangeText={setBodyPower} />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>POWER 3 (FUTURE)</Text>
              <TextInput style={styles.input} value={futurePower} onChangeText={setFuturePower} />
            </View>

            <TouchableOpacity style={styles.primaryBtn} onPress={() => setStep(4)}>
              <Text style={styles.primaryBtnText}>NEXT: DEFINE GOAL →</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Step 4: 90-Day Goal */}
        {step === 4 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepHeader}>STEP 2 / 6: MAIN 90-DAY GOAL</Text>
            <Text style={styles.instruction}>What is your singular main mission for this Winter Arc?</Text>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>PRIMARY GOAL</Text>
              <TextInput style={styles.input} value={mainGoal} onChangeText={setMainGoal} />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>YOUR REASON (WHY THIS MATTERS)</Text>
              <TextInput style={[styles.input, { height: 80 }]} multiline value={reason} onChangeText={setReason} />
            </View>

            <TouchableOpacity style={styles.primaryBtn} onPress={() => setStep(5)}>
              <Text style={styles.primaryBtnText}>NEXT: CREATE HABITS →</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Step 5: Create Habits */}
        {step === 5 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepHeader}>STEP 3 / 6: DEFINE NON-NEGOTIABLES</Text>
            <Text style={styles.instruction}>Configure your first non-negotiable habit with Min/Target/Stretch.</Text>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>HABIT NAME</Text>
              <TextInput style={styles.input} value={habit1Name} onChangeText={setHabit1Name} />
            </View>

            <View style={styles.triRow}>
              <View style={styles.triCol}>
                <Text style={styles.triLabel}>MINIMUM</Text>
                <TextInput style={styles.triInput} value={habit1Min} onChangeText={setHabit1Min} />
              </View>
              <View style={styles.triCol}>
                <Text style={styles.triLabel}>TARGET</Text>
                <TextInput style={styles.triInput} value={habit1Target} onChangeText={setHabit1Target} />
              </View>
              <View style={styles.triCol}>
                <Text style={styles.triLabel}>STRETCH</Text>
                <TextInput style={styles.triInput} value={habit1Stretch} onChangeText={setHabit1Stretch} />
              </View>
            </View>

            <TouchableOpacity style={styles.primaryBtn} onPress={() => setStep(6)}>
              <Text style={styles.primaryBtnText}>NEXT: SLEEP TARGET →</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Step 6: Sleep Target */}
        {step === 6 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepHeader}>STEP 4 / 6: SLEEP RECOVERY</Text>
            <Text style={styles.instruction}>Sleep is your foundation for high performance.</Text>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>TARGET SLEEP DURATION</Text>
              <TextInput style={styles.input} value={sleepTarget} onChangeText={setSleepTarget} />
            </View>

            <View style={styles.triRow}>
              <View style={styles.triCol}>
                <Text style={styles.triLabel}>BEDTIME</Text>
                <TextInput style={styles.triInput} value={bedtime} onChangeText={setBedtime} />
              </View>
              <View style={styles.triCol}>
                <Text style={styles.triLabel}>WAKE TIME</Text>
                <TextInput style={styles.triInput} value={wakeTime} onChangeText={setWakeTime} />
              </View>
            </View>

            <TouchableOpacity style={styles.primaryBtn} onPress={() => setStep(7)}>
              <Text style={styles.primaryBtnText}>NEXT: CONTRACT →</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Step 7: Contract Digital Signature */}
        {step === 7 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepHeader}>STEP 5 / 6: WINTER ARC CONTRACT</Text>
            <Text style={styles.instruction}>Digitally sign your 90-day commitment.</Text>

            <View style={styles.contractPreview}>
              <Text style={styles.contractTitle}>90-DAY COMMITMENT</Text>
              <Text style={styles.contractText}>• Main Goal: {mainGoal}</Text>
              <Text style={styles.contractText}>• Powers: {mindPower}, {bodyPower}, {futurePower}</Text>
              <Text style={styles.contractText}>• Sleep Target: {sleepTarget}</Text>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>DIGITAL SIGNATURE (FULL NAME)</Text>
              <TextInput style={styles.input} value={signature} onChangeText={setSignature} />
            </View>

            <TouchableOpacity style={styles.primaryBtn} onPress={handleFinish}>
              <Text style={styles.primaryBtnText}>BEGIN WINTER ARC ❄️</Text>
            </TouchableOpacity>
          </View>
        )}
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
    padding: SPACING.lg,
    justifyContent: 'center',
    flexGrow: 1
  },
  stepContainer: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.surfaceBorder,
    borderWidth: 1,
    borderRadius: 16,
    padding: SPACING.lg
  },
  tagline: {
    color: COLORS.iceAccent,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 8
  },
  heroTitle: {
    color: COLORS.primaryText,
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -1
  },
  bodyText: {
    color: COLORS.secondaryText,
    fontSize: 14,
    lineHeight: 22,
    marginVertical: SPACING.md
  },
  stepHeader: {
    color: COLORS.iceAccent,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 4
  },
  quoteText: {
    color: COLORS.primaryText,
    fontSize: 18,
    fontWeight: '700',
    fontStyle: 'italic',
    lineHeight: 26,
    marginVertical: SPACING.md
  },
  instruction: {
    color: COLORS.secondaryText,
    fontSize: 13,
    marginBottom: SPACING.md
  },
  fieldGroup: {
    marginBottom: SPACING.md
  },
  label: {
    color: COLORS.mutedText,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 6
  },
  input: {
    backgroundColor: COLORS.secondarySurface,
    borderColor: COLORS.surfaceBorder,
    borderWidth: 1,
    borderRadius: 8,
    padding: SPACING.sm,
    color: COLORS.primaryText,
    fontSize: 14
  },
  triRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md
  },
  triCol: {
    flex: 1,
    marginHorizontal: 3
  },
  triLabel: {
    color: COLORS.mutedText,
    fontSize: 9,
    fontWeight: '800',
    marginBottom: 4
  },
  triInput: {
    backgroundColor: COLORS.secondarySurface,
    borderColor: COLORS.surfaceBorder,
    borderWidth: 1,
    borderRadius: 6,
    padding: 8,
    color: COLORS.primaryText,
    fontSize: 12,
    textAlign: 'center'
  },
  contractPreview: {
    backgroundColor: COLORS.secondarySurface,
    padding: SPACING.md,
    borderRadius: 8,
    marginBottom: SPACING.md,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.iceAccent
  },
  contractTitle: {
    color: COLORS.iceAccent,
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 6
  },
  contractText: {
    color: COLORS.primaryText,
    fontSize: 12,
    marginVertical: 2
  },
  primaryBtn: {
    backgroundColor: COLORS.iceAccent,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: SPACING.md
  },
  primaryBtnText: {
    color: '#000',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1
  }
});
