import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal } from 'react-native';
import { COLORS, SPACING } from '../constants/theme';
import { apiRequest, getAuthToken } from '../services/api';
import { GoalDetailsScreen, GoalData } from './GoalDetailsScreen';
import { GmailLoginModal } from '../components/GmailLoginModal';

interface SleepEntry {
  bedtime: string;
  wakeTime: string;
  durationHours: number;
  quality: 'Restless' | 'Good' | 'Deep';
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const YEARS_LIST = [2024, 2025, 2026, 2027, 2028, 2029, 2030];

export const PaperWinterTrackerScreen: React.FC = () => {
  // Page Navigation State: 'TRACKER' | 'HABIT_GOAL_PAGE'
  const [currentView, setCurrentView] = useState<'TRACKER' | 'HABIT_GOAL_PAGE'>('TRACKER');
  const [activeHabitIdx, setActiveHabitIdx] = useState<number>(0);

  // Flexible Year & Month State
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedMonthIdx, setSelectedMonthIdx] = useState<number>(9); // 0-indexed, 9 = October
  const [isChangingMonth, setIsChangingMonth] = useState<boolean>(false);
  const [saveStatusMsg, setSaveStatusMsg] = useState<string>('SYNCHRONIZED WITH MONGODB 🟢');

  const selectedMonthName = MONTH_NAMES[selectedMonthIdx];
  const activeMonthKey = `${selectedYear}-${String(selectedMonthIdx + 1).padStart(2, '0')}`;

  // Keep a Ref of the currently loaded month key to avoid saving to wrong month during state transitions
  const loadedMonthKeyRef = useRef<string>('');

  // Profile Details
  const [name, setName] = useState('Chaitanya');
  const [startDate, setStartDate] = useState(`01 / ${String(selectedMonthIdx + 1).padStart(2, '0')} / ${selectedYear}`);

  // 10 Habits List
  const [habits, setHabits] = useState<string[]>([
    'Deep Coding Session',
    'Morning Workout',
    'Technical Reading',
    'Mindfulness & Journal',
    '3L Hydration',
    'Cold Shower',
    '10,000 Steps',
    'No Junk Food',
    '7.5h+ Quality Sleep',
    'Daily Review'
  ]);

  // Habit Goal Details Map (0 to 9) -> GoalData object
  const [habitDetailsMap, setHabitDetailsMap] = useState<{ [hIdx: number]: GoalData }>({});

  // Habit Matrix: "habitIdx_day" -> boolean
  const [habitGrid, setHabitGrid] = useState<{ [key: string]: boolean }>({});

  // Exact Sleep Matrix: day -> SleepEntry object
  const [sleepEntries, setSleepEntries] = useState<{ [day: number]: SleepEntry }>({});

  // Reflections
  const [monthlyGoal, setMonthlyGoal] = useState('');
  const [achievedThisMonth, setAchievedThisMonth] = useState('');
  const [shouldImprove, setShouldImprove] = useState('');

  // Modal Controls
  const [selectedSleepDay, setSelectedSleepDay] = useState<number | null>(null);
  const [showResetConfirmModal, setShowResetConfirmModal] = useState<boolean>(false);
  const [showGmailModal, setShowGmailModal] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Check Auth on Mount: Auto-login as Chaitanya (srikrishna@gmail.com) if no active user
  useEffect(() => {
    const checkAuth = async () => {
      try {
        let token = await getAuthToken();
        if (!token) {
          const res = await apiRequest('/auth/google', 'POST', {
            email: 'srikrishna@gmail.com',
            name: 'Chaitanya',
            googleId: 'google_srikrishna_default',
            picture: 'https://api.dicebear.com/7.x/bottts/svg?seed=Chaitanya'
          });
          if (res && (res.user || res.token)) {
            if (res.token) await setAuthToken(res.token);
            const activeUser = res.user || {
              _id: 'user_gmail_srikrishna_gmail_com',
              email: 'srikrishna@gmail.com',
              name: 'Chaitanya'
            };
            setCurrentUser(activeUser);
            setName('Chaitanya');
            await handleSwitchMonth(selectedYear, selectedMonthIdx, true);
            return;
          }
        }
        if (token) {
          const res = await apiRequest('/auth/me');
          if (res && res.success && res.user) {
            setCurrentUser(res.user);
            if (res.user.name) setName(res.user.name);
          }
          await handleSwitchMonth(selectedYear, selectedMonthIdx, true);
        }
      } catch (err) {
        console.warn('Auth check error:', err);
        await handleSwitchMonth(selectedYear, selectedMonthIdx, true);
      }
    };
    checkAuth();
  }, []);

  // Sleep Modal Input State
  const [modalBedtime, setModalBedtime] = useState('23:15');
  const [modalWakeTime, setModalWakeTime] = useState('06:45');
  const [modalQuality, setModalQuality] = useState<'Restless' | 'Good' | 'Deep'>('Good');

  // Save specific Month Data to MongoDB Atlas
  const saveMonthDataToBackend = async (mKey: string, payload: any) => {
    try {
      const res = await apiRequest(`/tracker/${mKey}`, 'POST', payload);
      if (res.success) {
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setSaveStatusMsg(`SAVED TO MONGODB AT ${timeStr} 🟢`);
      }
    } catch (err) {
      console.warn('Save month error:', err);
    }
  };

  // Explicit Save of Current State
  const saveCurrentMonthExplicitly = async () => {
    const currentKey = loadedMonthKeyRef.current;
    if (!currentKey || isChangingMonth) return;

    await saveMonthDataToBackend(currentKey, {
      name,
      startDate,
      habits,
      habitGrid,
      sleepGrid: sleepEntries,
      monthlyGoal,
      achievedThisMonth,
      shouldImprove,
      habitDetailsMap
    });
  };

  // Switch Month Handler: SAVE CURRENT MONTH FIRST, THEN LOAD TARGET MONTH!
  const handleSwitchMonth = async (newYear: number, newMonthIdx: number, forceFetch = false) => {
    const newMonthKey = `${newYear}-${String(newMonthIdx + 1).padStart(2, '0')}`;
    if (!forceFetch && loadedMonthKeyRef.current === newMonthKey) return;

    setIsChangingMonth(true);

    if (loadedMonthKeyRef.current && loadedMonthKeyRef.current !== newMonthKey) {
      setSaveStatusMsg('SAVING PREVIOUS MONTH DATA...');
      await saveMonthDataToBackend(loadedMonthKeyRef.current, {
        name,
        startDate,
        habits,
        habitGrid,
        sleepGrid: sleepEntries,
        monthlyGoal,
        achievedThisMonth,
        shouldImprove,
        habitDetailsMap
      });
    }

    // 2. UPDATE SELECTED MONTH & REF
    setSelectedYear(newYear);
    setSelectedMonthIdx(newMonthIdx);
    loadedMonthKeyRef.current = newMonthKey;

    // 3. CLEAR MEMORY STATE BEFORE LOADING TARGET MONTH
    setHabitGrid({});
    setSleepEntries({});
    setMonthlyGoal('');
    setAchievedThisMonth('');
    setShouldImprove('');
    setHabitDetailsMap({});

    setSaveStatusMsg(`LOADING ${MONTH_NAMES[newMonthIdx].toUpperCase()} ${newYear}...`);

    // 4. FETCH TARGET MONTH FROM MONGODB ATLAS
    try {
      const res = await apiRequest(`/tracker/${newMonthKey}`);
      if (res.success && res.tracker) {
        const t = res.tracker;
        setName(t.name || 'Chaitanya');
        setStartDate(t.startDate || `${newMonthKey}-01`);
        if (t.habits && t.habits.length === 10) setHabits(t.habits);
        setHabitGrid(t.habitGrid || {});
        setSleepEntries(t.sleepGrid || {});
        setMonthlyGoal(t.monthlyGoal || '');
        setAchievedThisMonth(t.achievedThisMonth || '');
        setShouldImprove(t.shouldImprove || '');
        if (t.habitDetailsMap) setHabitDetailsMap(t.habitDetailsMap);
      }
      setSaveStatusMsg(`LOADED & SYNCED WITH MONGODB 🟢`);
    } catch (err) {
      console.warn('Load month error:', err);
    } finally {
      setIsChangingMonth(false);
    }
  };

  // Initial Mount Load
  useEffect(() => {
    handleSwitchMonth(selectedYear, selectedMonthIdx);
  }, []);

  // Debounced Auto-save to MongoDB Atlas for currently active month
  useEffect(() => {
    if (isChangingMonth) return;
    const timer = setTimeout(() => {
      saveCurrentMonthExplicitly();
    }, 1200);
    return () => clearTimeout(timer);
  }, [habitGrid, sleepEntries, monthlyGoal, habitDetailsMap, achievedThisMonth, shouldImprove, habits]);

  const toggleHabitCell = (hIdx: number, day: number) => {
    const key = `${hIdx}_${day}`;
    setHabitGrid(prev => {
      const updatedGrid = {
        ...prev,
        [key]: !prev[key]
      };
      saveMonthDataToBackend(loadedMonthKeyRef.current, {
        name,
        startDate,
        habits,
        habitGrid: updatedGrid,
        sleepGrid: sleepEntries,
        monthlyGoal,
        achievedThisMonth,
        shouldImprove,
        habitDetailsMap
      });
      return updatedGrid;
    });
  };

  const openSleepModalForDay = (day: number) => {
    setSelectedSleepDay(day);
    const existing = sleepEntries[day];
    if (existing) {
      setModalBedtime(existing.bedtime);
      setModalWakeTime(existing.wakeTime);
      setModalQuality(existing.quality);
    } else {
      setModalBedtime('23:00');
      setModalWakeTime('06:30');
      setModalQuality('Good');
    }
  };

  const saveExactSleepForDay = () => {
    if (selectedSleepDay === null) return;
    const [bH, bM] = modalBedtime.split(':').map(Number);
    const [wH, wM] = modalWakeTime.split(':').map(Number);
    let diff = (wH + (wM || 0) / 60) - (bH + (bM || 0) / 60);
    if (diff <= 0) diff += 24;

    const entry: SleepEntry = {
      bedtime: modalBedtime,
      wakeTime: modalWakeTime,
      durationHours: parseFloat(diff.toFixed(1)),
      quality: modalQuality
    };

    const updatedSleep = { ...sleepEntries, [selectedSleepDay]: entry };
    setSleepEntries(updatedSleep);
    setSelectedSleepDay(null);

    saveMonthDataToBackend(loadedMonthKeyRef.current, {
      name,
      startDate,
      habits,
      habitGrid,
      sleepGrid: updatedSleep,
      monthlyGoal,
      achievedThisMonth,
      shouldImprove,
      habitDetailsMap
    });
  };

  const openGoalPageForHabit = (hIdx: number) => {
    setActiveHabitIdx(hIdx);
    setCurrentView('HABIT_GOAL_PAGE');
  };

  const updateGoalDataForActiveHabit = (updatedData: GoalData) => {
    setHabitDetailsMap(prev => ({
      ...prev,
      [activeHabitIdx]: updatedData
    }));
    if (updatedData.title) {
      const copy = [...habits];
      copy[activeHabitIdx] = updatedData.title;
      setHabits(copy);
    }
  };

  const executeConfirmedReset = () => {
    setHabitGrid({});
    setSleepEntries({});
    setAchievedThisMonth('');
    setShouldImprove('');
    setShowResetConfirmModal(false);
    saveCurrentMonthExplicitly();
  };

  if (currentView === 'HABIT_GOAL_PAGE') {
    const currentHabitName = habits[activeHabitIdx] || `Habit Goal #${activeHabitIdx + 1}`;
    const defaultData: GoalData = habitDetailsMap[activeHabitIdx] || {
      title: currentHabitName,
      description: `Detailed strategy and action plan for ${currentHabitName}.`,
      strategy: 'Execute daily targets consistently. Track daily completion.',
      targetDate: `30 / ${String(selectedMonthIdx + 1).padStart(2, '0')} / ${selectedYear}`,
      category: 'Habit Goal',
      steps: [
        { id: 's1', text: 'Step 1: Set daily baseline minimum', completed: true },
        { id: 's2', text: 'Step 2: Build 14-day execution streak', completed: true },
        { id: 's3', text: 'Step 3: Review & expand target capacity', completed: false }
      ]
    };

    return (
      <GoalDetailsScreen
        habitNumber={activeHabitIdx + 1}
        monthName={selectedMonthName}
        year={selectedYear}
        goalData={defaultData}
        onSave={(updated) => {
          updateGoalDataForActiveHabit(updated);
          saveCurrentMonthExplicitly();
        }}
        onBack={() => setCurrentView('TRACKER')}
      />
    );
  }

  const daysArray = Array.from({ length: 31 }, (_, i) => i + 1);
  const sleepHoursList = [10, 9, 8, 7, 6, 5, 4];

  let totalChecked = 0;
  Object.values(habitGrid).forEach(v => { if (v) totalChecked++; });
  const habitCompletionRate = Math.round((totalChecked / (10 * 31)) * 100) || 0;

  const validSleeps = Object.values(sleepEntries).map(s => s.durationHours);
  const avgSleep = validSleeps.length > 0 
    ? (validSleeps.reduce((a, b) => a + b, 0) / validSleeps.length).toFixed(1) 
    : '7.5';

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        nestedScrollEnabled={true}
        showsVerticalScrollIndicator={true}
      >

        {/* TOP CONTROLS: ANY YEAR & ANY MONTH SELECTOR */}
        <View style={styles.topControlBar}>
          <View style={styles.monthSelectorRow}>
            {/* Year Selector */}
            <View style={styles.pickerGroup}>
              <Text style={styles.pickerLabel}>YEAR:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.yearScroll}>
                {YEARS_LIST.map((yr) => (
                  <TouchableOpacity
                    key={yr}
                    style={[styles.yearBtn, selectedYear === yr && styles.yearBtnActive]}
                    onPress={() => handleSwitchMonth(yr, selectedMonthIdx)}
                  >
                    <Text style={[styles.yearText, selectedYear === yr && styles.yearTextActive]}>{yr}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>

          {/* Month Selector Grid */}
          <View style={styles.monthGridContainer}>
            <Text style={styles.pickerLabel}>MONTH:</Text>
            <View style={styles.monthGrid}>
              {MONTH_NAMES.map((mName, idx) => (
                <TouchableOpacity
                  key={mName}
                  style={[styles.monthGridBtn, selectedMonthIdx === idx && styles.monthGridBtnActive]}
                  onPress={() => handleSwitchMonth(selectedYear, idx)}
                >
                  <Text style={[styles.monthGridText, selectedMonthIdx === idx && styles.monthGridTextActive]}>
                    {mName.substring(0, 3)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.rightActionRow}>
            <TouchableOpacity 
              style={[styles.gmailAuthBtn, currentUser && styles.gmailAuthBtnLoggedIn]} 
              onPress={() => setShowGmailModal(true)}
            >
              <Text style={styles.googleGIcon}>G</Text>
              <Text style={styles.gmailAuthText}>
                {currentUser ? `${currentUser.email.split('@')[0].toUpperCase()} (SYNCED 🟢)` : 'LOGIN WITH GMAIL'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.manualSaveBtn} onPress={saveCurrentMonthExplicitly}>
              <Text style={styles.manualSaveText}>💾 SAVE SHEET TO MONGODB</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.freshResetBtn} onPress={() => setShowResetConfirmModal(true)}>
              <Text style={styles.freshResetText}>⚡ RESET MONTH</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* HEADER & METADATA SECTION */}
        <View style={styles.headerFrame}>
          <View style={styles.titleLineRow}>
            <View style={styles.decorativeLine} />
            <Text style={styles.headerTitle}>WINTER TRACKER</Text>
            <View style={styles.decorativeLine} />
          </View>

          <View style={styles.metaRow}>
            <View style={styles.metaField}>
              <Text style={styles.metaLabel}>Name :</Text>
              <TextInput style={styles.metaInput} value={name} onChangeText={setName} />
            </View>

            <View style={styles.metaField}>
              <Text style={styles.metaLabel}>Month :</Text>
              <Text style={styles.metaMonthText}>
                {selectedMonthName} {selectedYear}
              </Text>
            </View>

            <View style={styles.metaField}>
              <Text style={styles.metaLabel}>Start Date :</Text>
              <TextInput style={styles.metaInput} value={startDate} onChangeText={setStartDate} />
            </View>
          </View>
        </View>

        {/* STATS OVERVIEW BAR */}
        <View style={styles.statsBar}>
          <Text style={styles.statTag}>{saveStatusMsg}</Text>
          <Text style={styles.statTag}>CONSISTENCY: <Text style={{ color: '#22C55E' }}>{habitCompletionRate}%</Text></Text>
          <Text style={styles.statTag}>AVG SLEEP: <Text style={{ color: '#8BCEFF' }}>{avgSleep} HRS</Text></Text>
        </View>

        {/* PROMINENT GMAIL CLOUD AUTH BANNER */}
        <TouchableOpacity 
          style={[styles.headerAuthBanner, currentUser && styles.headerAuthBannerLoggedIn]} 
          onPress={() => setShowGmailModal(true)}
          activeOpacity={0.8}
        >
          <View style={styles.authBannerLeft}>
            <Text style={styles.authBannerGLogo}>G</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.authBannerTitle}>
                {currentUser ? `BACKED UP TO GMAIL: ${currentUser.email.toUpperCase()}` : 'GMAIL CLOUD BACKUP & SYNCRONIZATION'}
              </Text>
              <Text style={styles.authBannerSub}>
                {currentUser ? 'Click to manage your account or switch profiles' : 'Click here to sign in with your Gmail account & save habits permanently in MongoDB'}
              </Text>
            </View>
          </View>
          <View style={[styles.authBannerBtn, currentUser && styles.authBannerBtnLoggedIn]}>
            <Text style={styles.authBannerBtnText}>
              {currentUser ? 'ACCOUNT SETTINGS ⚙️' : 'LOGIN WITH GMAIL 🔑'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* GRID 1: 10 HABITS / 31 DAYS MATRIX */}
        <View style={styles.tableFrame}>
          <Text style={styles.tableSectionTitle}>10 HABITS / 31 DAYS MATRIX [{selectedMonthName.toUpperCase()} {selectedYear}] — CLICK [ 🔍 GOAL PAGE ] ON ANY HABIT TO ENTER DETAILS</Text>
          <ScrollView horizontal nestedScrollEnabled={true} showsHorizontalScrollIndicator={true}>
            <View>
              <View style={styles.tableRowHeader}>
                <View style={styles.habitNameColHeader}>
                  <Text style={styles.headerColText}>HABITS & GOAL BUTTON</Text>
                </View>
                {daysArray.map((d) => (
                  <View key={d} style={styles.dayHeaderCell}>
                    <Text style={styles.dayHeaderText}>{d}</Text>
                  </View>
                ))}
              </View>

              {habits.map((habitName, hIdx) => (
                <View key={hIdx} style={styles.tableRow}>
                  <View style={styles.habitNameCol}>
                    <Text style={styles.habitNumText}>{hIdx + 1}.</Text>
                    <TextInput
                      style={styles.habitNameInput}
                      value={habitName}
                      onChangeText={(val) => {
                        const copy = [...habits];
                        copy[hIdx] = val;
                        setHabits(copy);
                      }}
                    />
                    <TouchableOpacity
                      style={styles.individualGoalBtn}
                      onPress={() => openGoalPageForHabit(hIdx)}
                    >
                      <Text style={styles.individualGoalBtnText}>🔍 GOAL PAGE</Text>
                    </TouchableOpacity>
                  </View>

                  {daysArray.map((d) => {
                    const isChecked = !!habitGrid[`${hIdx}_${d}`];
                    return (
                      <TouchableOpacity
                        key={d}
                        style={[styles.checkCell, isChecked && styles.checkCellActive]}
                        onPress={() => toggleHabitCell(hIdx, d)}
                        activeOpacity={0.7}
                      >
                        {isChecked && <Text style={styles.checkMarkText}>✓</Text>}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* GRID 2: EXACT SLEEP MATRIX & LOGGING */}
        <View style={styles.tableFrame}>
          <View style={styles.tableTitleRow}>
            <Text style={styles.tableSectionTitle}>EXACT SLEEP TRACKING MATRIX (TAP CELL TO EDIT EXACT BEDTIME & WAKE TIME)</Text>
          </View>

          <ScrollView horizontal nestedScrollEnabled={true} showsHorizontalScrollIndicator={true}>
            <View>
              <View style={styles.tableRowHeader}>
                <View style={styles.sleepHeaderCol}>
                  <Text style={styles.headerColText}>SLEEP HRS</Text>
                </View>
                {daysArray.map((d) => (
                  <View key={d} style={styles.dayHeaderCell}>
                    <Text style={styles.dayHeaderText}>{d}</Text>
                  </View>
                ))}
              </View>

              {sleepHoursList.map((hrs) => (
                <View key={hrs} style={styles.tableRow}>
                  <View style={styles.sleepHeaderCol}>
                    <Text style={styles.sleepHrsText}>{hrs} hrs</Text>
                  </View>

                  {daysArray.map((d) => {
                    const entry = sleepEntries[d];
                    const isMatched = entry && Math.round(entry.durationHours) === hrs;

                    return (
                      <TouchableOpacity
                        key={d}
                        style={[styles.sleepCell, isMatched && styles.sleepCellSelected]}
                        onPress={() => openSleepModalForDay(d)}
                        activeOpacity={0.7}
                      >
                        {isMatched ? (
                          <View style={styles.sleepDot} />
                        ) : entry ? (
                          <Text style={styles.sleepDurationSubText}>{entry.durationHours}h</Text>
                        ) : null}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* THREE REFLECTION PANELS */}
        <View style={styles.reflectionRow}>
          <View style={styles.reflectionPanel}>
            <Text style={styles.reflectionTitle}>MY MONTHLY GOAL</Text>
            <TextInput
              style={styles.reflectionInput}
              multiline
              value={monthlyGoal}
              onChangeText={setMonthlyGoal}
              placeholder="Enter main overall monthly goal..."
              placeholderTextColor={COLORS.mutedText}
            />
          </View>

          <View style={styles.reflectionPanel}>
            <Text style={styles.reflectionTitle}>WHAT I HAVE ACHIEVED THIS MONTH</Text>
            <TextInput
              style={styles.reflectionInput}
              multiline
              value={achievedThisMonth}
              onChangeText={setAchievedThisMonth}
              placeholder="List achievements & wins..."
              placeholderTextColor={COLORS.mutedText}
            />
          </View>

          <View style={styles.reflectionPanel}>
            <Text style={styles.reflectionTitle}>WHAT SHOULD I IMPROVE</Text>
            <TextInput
              style={styles.reflectionInput}
              multiline
              value={shouldImprove}
              onChangeText={setShouldImprove}
              placeholder="List friction points to fix..."
              placeholderTextColor={COLORS.mutedText}
            />
          </View>
        </View>

      </ScrollView>

      {/* 1. CONFIRM RESET MODAL */}
      {showResetConfirmModal && (
        <Modal visible={true} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalCardAlert}>
              <Text style={styles.alertIcon}>⚠️</Text>
              <Text style={styles.modalTitleAlert}>CONFIRM MONTHLY RESET</Text>
              <Text style={styles.modalSubAlert}>
                Are you sure you want to reset all habit ticks, sleep logs, and reflections for {selectedMonthName} {selectedYear}?
              </Text>
              <Text style={styles.alertWarningText}>This will clear the active sheet for this month.</Text>

              <View style={styles.modalActionsAlert}>
                <TouchableOpacity style={styles.dangerConfirmBtn} onPress={executeConfirmedReset}>
                  <Text style={styles.dangerConfirmText}>YES, RESET SHEET</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelAlertBtn} onPress={() => setShowResetConfirmModal(false)}>
                  <Text style={styles.cancelAlertText}>CANCEL</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* 2. EXACT SLEEP TIME EDITOR MODAL */}
      {selectedSleepDay !== null && (
        <Modal visible={true} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>LOG EXACT SLEEP — DAY {selectedSleepDay}</Text>
              <Text style={styles.modalSub}>Specify exact bedtime & wake time down to the minute.</Text>

              <View style={styles.inputRow}>
                <View style={styles.timeCol}>
                  <Text style={styles.fieldLabel}>BEDTIME (HH:MM)</Text>
                  <TextInput
                    style={styles.timeInput}
                    value={modalBedtime}
                    onChangeText={setModalBedtime}
                    placeholder="23:15"
                    placeholderTextColor={COLORS.mutedText}
                  />
                </View>

                <View style={styles.timeCol}>
                  <Text style={styles.fieldLabel}>WAKE TIME (HH:MM)</Text>
                  <TextInput
                    style={styles.timeInput}
                    value={modalWakeTime}
                    onChangeText={setModalWakeTime}
                    placeholder="06:45"
                    placeholderTextColor={COLORS.mutedText}
                  />
                </View>
              </View>

              <Text style={styles.fieldLabel}>SLEEP QUALITY</Text>
              <View style={styles.qualityRow}>
                {(['Restless', 'Good', 'Deep'] as const).map((q) => (
                  <TouchableOpacity
                    key={q}
                    style={[styles.qualityBtn, modalQuality === q && styles.qualityBtnActive]}
                    onPress={() => setModalQuality(q)}
                  >
                    <Text style={[styles.qualityText, modalQuality === q && styles.qualityTextActive]}>{q}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.saveBtn} onPress={saveExactSleepForDay}>
                  <Text style={styles.saveBtnText}>SAVE EXACT SLEEP</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setSelectedSleepDay(null)}>
                  <Text style={styles.cancelBtnText}>CANCEL</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* 3. GMAIL LOGIN & CLOUD BACKUP MODAL */}
      <GmailLoginModal
        visible={showGmailModal}
        onClose={() => setShowGmailModal(false)}
        currentUser={currentUser}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          if (user.name) setName(user.name);
          setSaveStatusMsg(`LOGGED IN AS ${user.email.toUpperCase()} 🟢`);
          handleSwitchMonth(selectedYear, selectedMonthIdx);
        }}
        onLogoutSuccess={() => {
          setCurrentUser(null);
          setName('Alex Vance');
          setSaveStatusMsg('LOGGED OUT — GUEST MODE ⚪');
          handleSwitchMonth(selectedYear, selectedMonthIdx);
        }}
      />
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
    paddingBottom: 160
  },
  topControlBar: {
    backgroundColor: '#111318',
    borderColor: '#232730',
    borderWidth: 1,
    borderRadius: 12,
    padding: SPACING.sm,
    marginBottom: SPACING.sm
  },
  monthSelectorRow: {
    marginBottom: SPACING.xs
  },
  pickerGroup: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  pickerLabel: {
    color: '#8BCEFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
    marginRight: 6
  },
  yearScroll: {
    flexDirection: 'row'
  },
  yearBtn: {
    backgroundColor: '#181B21',
    borderColor: '#232730',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginRight: 4
  },
  yearBtnActive: {
    backgroundColor: 'rgba(139, 206, 255, 0.2)',
    borderColor: '#8BCEFF'
  },
  yearText: {
    color: '#9CA3AF',
    fontSize: 10,
    fontWeight: '700'
  },
  yearTextActive: {
    color: '#8BCEFF',
    fontWeight: '900'
  },
  monthGridContainer: {
    marginTop: 4
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 4
  },
  monthGridBtn: {
    backgroundColor: '#181B21',
    borderColor: '#232730',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4
  },
  monthGridBtnActive: {
    backgroundColor: '#22C55E',
    borderColor: '#22C55E'
  },
  monthGridText: {
    color: '#9CA3AF',
    fontSize: 10,
    fontWeight: '700'
  },
  monthGridTextActive: {
    color: '#FFF',
    fontWeight: '900'
  },
  rightActionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 8,
    marginTop: 10
  },
  manualSaveBtn: {
    backgroundColor: '#181B21',
    borderColor: '#8BCEFF',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6
  },
  manualSaveText: {
    color: '#8BCEFF',
    fontSize: 10,
    fontWeight: '900'
  },
  freshResetBtn: {
    backgroundColor: '#181B21',
    borderColor: '#EF4444',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6
  },
  freshResetText: {
    color: '#EF4444',
    fontSize: 10,
    fontWeight: '800'
  },
  headerFrame: {
    backgroundColor: '#111318',
    borderColor: '#232730',
    borderWidth: 1,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.sm
  },
  titleLineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md
  },
  decorativeLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#374151'
  },
  headerTitle: {
    color: '#F5F5F5',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 3,
    marginHorizontal: 12,
    fontFamily: 'serif'
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8
  },
  metaField: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 180
  },
  metaLabel: {
    color: '#9CA3AF',
    fontSize: 11,
    fontWeight: '800',
    marginRight: 6
  },
  metaInput: {
    flex: 1,
    color: '#8BCEFF',
    fontSize: 13,
    fontWeight: '700',
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
    paddingVertical: 2
  },
  metaMonthText: {
    color: '#22C55E',
    fontSize: 13,
    fontWeight: '800'
  },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#181B21',
    borderRadius: 8,
    padding: SPACING.sm,
    marginBottom: SPACING.md
  },
  statTag: {
    color: '#9CA3AF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  tableFrame: {
    backgroundColor: '#111318',
    borderColor: '#232730',
    borderWidth: 1,
    borderRadius: 12,
    padding: SPACING.sm,
    marginBottom: SPACING.md
  },
  tableSectionTitle: {
    color: '#8BCEFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
    paddingLeft: 4,
    marginBottom: 6
  },
  tableRowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#181B21',
    borderRadius: 6,
    marginBottom: 4
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2
  },
  habitNameColHeader: {
    width: 230,
    paddingVertical: 6,
    paddingHorizontal: 8
  },
  headerColText: {
    color: '#F5F5F5',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1
  },
  dayHeaderCell: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#232730'
  },
  dayHeaderText: {
    color: '#9CA3AF',
    fontSize: 10,
    fontWeight: '800'
  },
  habitNameCol: {
    width: 230,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    backgroundColor: '#181B21',
    borderRadius: 4,
    marginRight: 2
  },
  habitNumText: {
    color: '#8BCEFF',
    fontSize: 11,
    fontWeight: '800',
    marginRight: 2,
    width: 18
  },
  habitNameInput: {
    flex: 1,
    color: '#F5F5F5',
    fontSize: 11,
    fontWeight: '600',
    paddingVertical: 4
  },
  individualGoalBtn: {
    backgroundColor: 'rgba(139, 206, 255, 0.15)',
    borderColor: '#8BCEFF',
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    marginLeft: 4
  },
  individualGoalBtnText: {
    color: '#8BCEFF',
    fontSize: 8,
    fontWeight: '900'
  },
  checkCell: {
    width: 28,
    height: 28,
    backgroundColor: '#181B21',
    borderRadius: 4,
    marginHorizontal: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#232730'
  },
  checkCellActive: {
    backgroundColor: '#22C55E',
    borderColor: '#22C55E'
  },
  checkMarkText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '900'
  },
  sleepHeaderCol: {
    width: 230,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: '#181B21',
    borderRadius: 4,
    marginRight: 2
  },
  sleepHrsText: {
    color: '#9CA3AF',
    fontSize: 10,
    fontWeight: '800'
  },
  sleepCell: {
    width: 28,
    height: 24,
    backgroundColor: '#181B21',
    borderRadius: 4,
    marginHorizontal: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#232730'
  },
  sleepCellSelected: {
    backgroundColor: 'rgba(139, 206, 255, 0.25)',
    borderColor: '#8BCEFF'
  },
  sleepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#8BCEFF'
  },
  sleepDurationSubText: {
    color: '#6B7280',
    fontSize: 8,
    fontWeight: '700'
  },
  reflectionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md
  },
  reflectionPanel: {
    flex: 1,
    minWidth: 260,
    backgroundColor: '#111318',
    borderColor: '#232730',
    borderWidth: 1,
    borderRadius: 12,
    padding: SPACING.md
  },
  reflectionTitle: {
    color: '#F5F5F5',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
    backgroundColor: '#181B21',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginBottom: SPACING.xs
  },
  reflectionInput: {
    color: '#F5F5F5',
    fontSize: 12,
    lineHeight: 18,
    minHeight: 100,
    textAlignVertical: 'top'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.md
  },
  modalCardAlert: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#111318',
    borderColor: '#EF4444',
    borderWidth: 2,
    borderRadius: 16,
    padding: SPACING.lg,
    alignItems: 'center'
  },
  alertIcon: {
    fontSize: 28,
    marginBottom: 6
  },
  modalTitleAlert: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 6
  },
  modalSubAlert: {
    color: '#F5F5F5',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18
  },
  alertWarningText: {
    color: '#9CA3AF',
    fontSize: 11,
    marginTop: 8,
    marginBottom: SPACING.md,
    textAlign: 'center'
  },
  modalActionsAlert: {
    flexDirection: 'row',
    gap: 10
  },
  dangerConfirmBtn: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8
  },
  dangerConfirmText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '900'
  },
  cancelAlertBtn: {
    backgroundColor: '#181B21',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8
  },
  cancelAlertText: {
    color: '#9CA3AF',
    fontSize: 11,
    fontWeight: '700'
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
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
    letterSpacing: 0.5
  },
  modalSub: {
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 2,
    marginBottom: SPACING.md
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: SPACING.sm
  },
  timeCol: {
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
  timeInput: {
    backgroundColor: '#181B21',
    borderColor: '#232730',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    color: '#8BCEFF',
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center'
  },
  qualityRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: SPACING.md
  },
  qualityBtn: {
    flex: 1,
    backgroundColor: '#181B21',
    borderColor: '#232730',
    borderWidth: 1,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center'
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
    fontWeight: '900'
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: SPACING.md
  },
  saveBtn: {
    backgroundColor: '#8BCEFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8
  },
  saveBtnText: {
    color: '#000',
    fontSize: 11,
    fontWeight: '900'
  },
  cancelBtn: {
    backgroundColor: '#181B21',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8
  },
  cancelBtnText: {
    color: '#9CA3AF',
    fontSize: 11,
    fontWeight: '700'
  },
  gmailAuthBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EA4335',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8
  },
  gmailAuthBtnLoggedIn: {
    backgroundColor: '#161922',
    borderWidth: 1,
    borderColor: '#4285F4'
  },
  googleGIcon: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '900'
  },
  gmailAuthText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8
  },
  headerAuthBanner: {
    backgroundColor: '#11141D',
    borderWidth: 1,
    borderColor: '#EA4335',
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
    gap: 12,
    boxShadow: '0 4px 14px rgba(234, 67, 53, 0.2)'
  },
  headerAuthBannerLoggedIn: {
    backgroundColor: '#0E1610',
    borderColor: '#00FF66',
    boxShadow: '0 4px 14px rgba(0, 255, 102, 0.15)'
  },
  authBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1
  },
  authBannerGLogo: {
    fontSize: 24,
    fontWeight: '900',
    color: '#EA4335'
  },
  authBannerTitle: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1
  },
  authBannerSub: {
    color: '#888',
    fontSize: 10,
    marginTop: 2
  },
  authBannerBtn: {
    backgroundColor: '#EA4335',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8
  },
  authBannerBtnLoggedIn: {
    backgroundColor: '#16281E',
    borderWidth: 1,
    borderColor: '#00FF66'
  },
  authBannerBtnText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8
  }
});
