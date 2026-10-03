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
  const [authModalMode, setAuthModalMode] = useState<'LOGIN' | 'SIGNUP' | 'GMAIL'>('SIGNUP');
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Check Auth on Mount: Validate token or prompt Sign Up / Login Modal
  useEffect(() => {
    const checkAuth = async () => {
      try {
        let token = await getAuthToken();
        if (!token) {
          // If no user is logged in, show AuthModal automatically
          setShowGmailModal(true);
          await handleSwitchMonth(selectedYear, selectedMonthIdx, true);
          return;
        }

        const res = await apiRequest('/auth/me');
        if (res && res.success && res.user) {
          setCurrentUser(res.user);
          if (res.user.name) setName(res.user.name);
        } else {
          // Token invalid or expired, prompt login
          setShowGmailModal(true);
        }
        await handleSwitchMonth(selectedYear, selectedMonthIdx, true);
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

  // Save specific Month Data to MongoDB Atlas & Local Storage
  const saveMonthDataToBackend = async (mKey: string, payload: any) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const uId = currentUser?._id || 'guest';
        window.localStorage.setItem(`winter_arc_sheet_${uId}_${mKey}`, JSON.stringify(payload));
      }
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

    const uId = currentUser?._id || 'guest';

    // 3. INSTANT LOCAL STORAGE CACHE LOAD (0ms latency)
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const cached = window.localStorage.getItem(`winter_arc_sheet_${uId}_${newMonthKey}`);
        if (cached) {
          const t = JSON.parse(cached);
          if (t.name) setName(t.name);
          if (t.startDate) setStartDate(t.startDate);
          if (t.habits && t.habits.length === 10) setHabits(t.habits);
          setHabitGrid(t.habitGrid || {});
          setSleepEntries(t.sleepGrid || t.sleepEntries || {});
          setMonthlyGoal(t.monthlyGoal || '');
          setAchievedThisMonth(t.achievedThisMonth || '');
          setShouldImprove(t.shouldImprove || '');
          if (t.habitDetailsMap) setHabitDetailsMap(t.habitDetailsMap);
        } else {
          setHabitGrid({});
          setSleepEntries({});
          setMonthlyGoal('');
          setAchievedThisMonth('');
          setShouldImprove('');
          setHabitDetailsMap({});
        }
      } catch (e) {
        setHabitGrid({});
        setSleepEntries({});
      }
    } else {
      setHabitGrid({});
      setSleepEntries({});
      setMonthlyGoal('');
      setAchievedThisMonth('');
      setShouldImprove('');
      setHabitDetailsMap({});
    }

    setSaveStatusMsg(`LOADING ${MONTH_NAMES[newMonthIdx].toUpperCase()} ${newYear}...`);

    // 4. FETCH TARGET MONTH FROM MONGODB ATLAS
    try {
      const res = await apiRequest(`/tracker/${newMonthKey}`);
      if (res.success && res.tracker) {
        const t = res.tracker;
        setName(t.name || currentUser?.name || 'Achiever');
        setStartDate(t.startDate || `${newMonthKey}-01`);
        if (t.habits && t.habits.length === 10) setHabits(t.habits);
        setHabitGrid(t.habitGrid || {});
        setSleepEntries(t.sleepGrid || {});
        setMonthlyGoal(t.monthlyGoal || '');
        setAchievedThisMonth(t.achievedThisMonth || '');
        setShouldImprove(t.shouldImprove || '');
        if (t.habitDetailsMap) setHabitDetailsMap(t.habitDetailsMap);

        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(`winter_arc_sheet_${uId}_${newMonthKey}`, JSON.stringify(t));
        }
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
    // If viewing the current active month, restrict logging strictly to Today (currentRealDay)
    if (isCurrentActiveMonth && day !== currentRealDay) {
      setSaveStatusMsg(`🔒 DISCIPLINE LOCK: ONLY TODAY (DAY ${currentRealDay}) IS EDITABLE! ⚠️`);
      setTimeout(() => {
        setSaveStatusMsg('SYNCHRONIZED WITH MONGODB 🟢');
      }, 2500);
      return;
    }

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
    if (isCurrentActiveMonth && day !== currentRealDay) {
      setSaveStatusMsg(`🔒 DISCIPLINE LOCK: ONLY TODAY (DAY ${currentRealDay}) SLEEP IS EDITABLE! ⚠️`);
      setTimeout(() => {
        setSaveStatusMsg('SYNCHRONIZED WITH MONGODB 🟢');
      }, 2500);
      return;
    }
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

  // Current real date calculation
  const now = new Date();
  const currentRealYear = now.getFullYear();
  const currentRealMonthIdx = now.getMonth();
  const currentRealDay = now.getDate();

  const isCurrentActiveMonth = (selectedYear === currentRealYear && selectedMonthIdx === currentRealMonthIdx);

  // Parse custom startDayNum from startDate (e.g. "01 / 10 / 2026" -> 1)
  let startDayNum = 1;
  if (startDate) {
    const firstPart = startDate.split('/')[0]?.trim();
    const parsed = parseInt(firstPart, 10);
    if (!isNaN(parsed) && parsed >= 1 && parsed <= 31) {
      startDayNum = parsed;
    }
  }

  // Active tracking days from custom Start Date to end of month (31)
  const activeDaysCount = Math.max(1, 31 - startDayNum + 1);

  // Count habits checked starting from startDayNum onwards
  let totalCheckedFromStart = 0;
  for (let hIdx = 0; hIdx < 10; hIdx++) {
    for (let d = startDayNum; d <= 31; d++) {
      if (habitGrid[`${hIdx}_${d}`]) {
        totalCheckedFromStart++;
      }
    }
  }

  const habitCompletionRate = Math.round((totalCheckedFromStart / (10 * activeDaysCount)) * 100) || 0;

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
            {currentUser ? (
              <TouchableOpacity 
                style={[styles.gmailAuthBtn, styles.gmailAuthBtnLoggedIn]} 
                onPress={() => {
                  setAuthModalMode('SIGNUP');
                  setShowGmailModal(true);
                }}
              >
                <Text style={styles.googleGIcon}>👤</Text>
                <Text style={styles.gmailAuthText}>
                  {currentUser.name ? currentUser.name.toUpperCase() : currentUser.email.split('@')[0].toUpperCase()} (SYNCED 🟢)
                </Text>
              </TouchableOpacity>
            ) : (
              <>
                <TouchableOpacity 
                  style={styles.signUpTopBtn} 
                  onPress={() => {
                    setAuthModalMode('SIGNUP');
                    setShowGmailModal(true);
                  }}
                >
                  <Text style={styles.signUpTopText}>✨ SIGN UP</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.loginTopBtn} 
                  onPress={() => {
                    setAuthModalMode('LOGIN');
                    setShowGmailModal(true);
                  }}
                >
                  <Text style={styles.loginTopText}>🔑 LOG IN</Text>
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity style={styles.manualSaveBtn} onPress={saveCurrentMonthExplicitly}>
              <Text style={styles.manualSaveText}>💾 SAVE SHEET</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.freshResetBtn} onPress={() => setShowResetConfirmModal(true)}>
              <Text style={styles.freshResetText}>⚡ RESET</Text>
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

        {/* PROMINENT USER AUTH BANNER WITH DEDICATED SIGN UP & LOG IN BUTTONS */}
        <View style={[styles.headerAuthBanner, currentUser && styles.headerAuthBannerLoggedIn]}>
          <View style={styles.authBannerLeft}>
            <Text style={styles.authBannerGLogo}>{currentUser ? '👤' : '🔒'}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.authBannerTitle}>
                {currentUser
                  ? `LOGGED IN: ${currentUser.name.toUpperCase()} (${currentUser.email})`
                  : 'INDIVIDUAL SHEET ACCESS — CREATE ACCOUNT OR LOG IN'}
              </Text>
              <Text style={styles.authBannerSub}>
                {currentUser
                  ? 'Your monthly habit sheet & progress are remembered individually in MongoDB Atlas.'
                  : 'Sign up to create your individual sheet so your progress is saved uniquely for your account.'}
              </Text>
            </View>
          </View>

          <View style={styles.authBannerBtnRow}>
            {currentUser ? (
              <TouchableOpacity
                style={styles.bannerAccountBtn}
                onPress={() => {
                  setAuthModalMode('SIGNUP');
                  setShowGmailModal(true);
                }}
              >
                <Text style={styles.bannerAccountBtnText}>ACCOUNT / SWITCH USER ⚙️</Text>
              </TouchableOpacity>
            ) : (
              <>
                <TouchableOpacity
                  style={styles.bannerSignUpBtn}
                  onPress={() => {
                    setAuthModalMode('SIGNUP');
                    setShowGmailModal(true);
                  }}
                >
                  <Text style={styles.bannerSignUpBtnText}>✨ SIGN UP (CREATE ACCOUNT)</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.bannerLogInBtn}
                  onPress={() => {
                    setAuthModalMode('LOGIN');
                    setShowGmailModal(true);
                  }}
                >
                  <Text style={styles.bannerLogInBtnText}>🔑 LOG IN (SIGN IN)</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        {/* GRID 1: 10 HABITS / 31 DAYS MATRIX */}
        <View style={styles.tableFrame}>
          <Text style={styles.tableSectionTitle}>10 HABITS / 31 DAYS MATRIX [{selectedMonthName.toUpperCase()} {selectedYear}] — CLICK [ 🔍 GOAL PAGE ] ON ANY HABIT TO ENTER DETAILS</Text>
          <ScrollView horizontal nestedScrollEnabled={true} showsHorizontalScrollIndicator={true}>
            <View>
              <View style={styles.tableRowHeader}>
                <View style={styles.habitNameColHeader}>
                  <Text style={styles.headerColText}>HABITS & GOAL BUTTON</Text>
                </View>
                {daysArray.map((d) => {
                  const isToday = isCurrentActiveMonth && d === currentRealDay;
                  return (
                    <View key={d} style={[styles.dayHeaderCell, isToday && styles.dayHeaderCellToday]}>
                      <Text style={[styles.dayHeaderText, isToday && styles.dayHeaderTextToday]}>
                        {d}{isToday ? '★' : ''}
                      </Text>
                    </View>
                  );
                })}
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
                    const isToday = isCurrentActiveMonth && d === currentRealDay;
                    const isLocked = isCurrentActiveMonth && d !== currentRealDay;

                    return (
                      <TouchableOpacity
                        key={d}
                        style={[
                          styles.checkCell,
                          isToday && styles.checkCellToday,
                          isLocked && styles.checkCellLocked,
                          isChecked && styles.checkCellActive
                        ]}
                        onPress={() => toggleHabitCell(hIdx, d)}
                        activeOpacity={isLocked ? 0.9 : 0.7}
                      >
                        {isChecked ? (
                          <Text style={styles.checkMarkText}>✓</Text>
                        ) : isToday ? (
                          <Text style={styles.todayStarText}>★</Text>
                        ) : isLocked ? (
                          <Text style={styles.lockDotText}>•</Text>
                        ) : null}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}

              {/* NEW BOTTOM SUMMARY ROW: DAILY WORK COMPLETED % */}
              <View style={styles.dailyPercentRow}>
                <View style={styles.habitNameColHeader}>
                  <Text style={styles.dailyPercentLabel}>📊 DAILY COMPLETED %</Text>
                </View>
                {daysArray.map((d) => {
                  let dayCheckedCount = 0;
                  for (let hIdx = 0; hIdx < 10; hIdx++) {
                    if (habitGrid[`${hIdx}_${d}`]) {
                      dayCheckedCount++;
                    }
                  }
                  const pct = Math.round((dayCheckedCount / 10) * 100);

                  let pctColor = '#475569';
                  let bgAlpha = 'transparent';
                  if (pct >= 90) {
                    pctColor = '#00FF66';
                    bgAlpha = 'rgba(0, 255, 102, 0.22)';
                  } else if (pct >= 70) {
                    pctColor = '#8BCEFF';
                    bgAlpha = 'rgba(139, 206, 255, 0.2)';
                  } else if (pct >= 50) {
                    pctColor = '#F59E0B';
                    bgAlpha = 'rgba(245, 158, 11, 0.2)';
                  } else if (pct > 0) {
                    pctColor = '#EAB308';
                    bgAlpha = 'rgba(234, 179, 8, 0.15)';
                  }

                  return (
                    <View key={d} style={[styles.dailyPercentCell, { backgroundColor: bgAlpha }]}>
                      <Text style={[styles.dailyPercentText, { color: pctColor }]}>
                        {pct > 0 ? `${pct}%` : '-'}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          </ScrollView>
        </View>

        {/* GRID 2: EXACT SLEEP MATRIX & LOGGING */}
        <View style={styles.tableFrame}>
          <View style={{ marginBottom: 4 }}>
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

      {/* 3. AUTH & LOGIN / SIGN UP MODAL */}
      <GmailLoginModal
        visible={showGmailModal}
        initialMode={authModalMode}
        onClose={() => setShowGmailModal(false)}
        currentUser={currentUser}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          if (user.name) setName(user.name);
          setSaveStatusMsg(`LOGGED IN AS ${user.name ? user.name.toUpperCase() : user.email.toUpperCase()} 🟢`);
          handleSwitchMonth(selectedYear, selectedMonthIdx, true);
        }}
        onLogoutSuccess={() => {
          setCurrentUser(null);
          setName('Achiever');
          setHabitGrid({});
          setSleepEntries({});
          setMonthlyGoal('');
          setAchievedThisMonth('');
          setShouldImprove('');
          setHabitDetailsMap({});
          setSaveStatusMsg('LOGGED OUT — PLEASE SIGN IN OR CREATE ACCOUNT ⚪');
          handleSwitchMonth(selectedYear, selectedMonthIdx, true);
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
    borderRightColor: '#282C38'
  },
  dayHeaderCellToday: {
    backgroundColor: 'rgba(0, 255, 102, 0.25)',
    borderWidth: 1.5,
    borderColor: '#00FF66',
    borderRadius: 4
  },
  dayHeaderText: {
    color: '#9CA3AF',
    fontSize: 10,
    fontWeight: '800'
  },
  dayHeaderTextToday: {
    color: '#00FF66',
    fontWeight: '900'
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
    backgroundColor: '#0D0E14',
    borderRadius: 4,
    marginHorizontal: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2A2E3D'
  },
  checkCellActive: {
    backgroundColor: '#00FF66',
    borderColor: '#00FF66',
    boxShadow: '0 0 10px rgba(0, 255, 102, 0.6)'
  },
  checkCellToday: {
    borderWidth: 1.5,
    borderColor: '#00FF66',
    backgroundColor: 'rgba(0, 255, 102, 0.12)'
  },
  checkCellLocked: {
    opacity: 0.5,
    backgroundColor: '#07080B',
    borderColor: '#1C1F2B'
  },
  checkMarkText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '900',
    lineHeight: 16,
    textAlign: 'center'
  },
  todayStarText: {
    color: '#00FF66',
    fontSize: 10,
    fontWeight: '900'
  },
  lockDotText: {
    color: '#2C303E',
    fontSize: 10
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
  },
  dailyPercentRow: {
    flexDirection: 'row',
    backgroundColor: '#0A0C10',
    borderTopWidth: 2,
    borderTopColor: '#22252E',
    marginTop: 4
  },
  dailyPercentLabel: {
    color: '#00FF66',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8
  },
  dailyPercentCell: {
    width: 32,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#1A1D24'
  },
  dailyPercentText: {
    fontSize: 9,
    fontWeight: '900',
    textAlign: 'center'
  },
  signUpTopBtn: {
    backgroundColor: '#22C55E',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6
  },
  signUpTopText: {
    color: '#090A0C',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8
  },
  loginTopBtn: {
    backgroundColor: '#181B21',
    borderColor: '#8BCEFF',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6
  },
  loginTopText: {
    color: '#8BCEFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8
  },
  authBannerBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  bannerSignUpBtn: {
    backgroundColor: '#22C55E',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 8
  },
  bannerSignUpBtnText: {
    color: '#090A0C',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8
  },
  bannerLogInBtn: {
    backgroundColor: '#161B26',
    borderWidth: 1,
    borderColor: '#8BCEFF',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 8
  },
  bannerLogInBtnText: {
    color: '#8BCEFF',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8
  },
  bannerAccountBtn: {
    backgroundColor: '#16281E',
    borderWidth: 1,
    borderColor: '#00FF66',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 8
  },
  bannerAccountBtnText: {
    color: '#00FF66',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8
  }
});
