import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiRequest, setAuthToken, syncOfflineData } from '../services/api';
import { User, Arc, Habit, DailyLog, Goal, HabitResult, HabitStatus, ScoreBreakdown } from '../types';

interface AppContextType {
  user: User | null;
  token: string | null;
  arc: Arc | null;
  habits: Habit[];
  todayLog: DailyLog | null;
  goals: Goal[];
  score: number;
  scoreBreakdown: ScoreBreakdown | null;
  isLoading: boolean;
  isDemoMode: boolean;

  // Actions
  login: (email: string, pass: string) => Promise<boolean>;
  register: (name: string, email: string, pass: string) => Promise<boolean>;
  logout: () => Promise<void>;
  toggleDemoMode: (enable?: boolean) => Promise<void>;
  createWinterArc: (arcData: any) => Promise<boolean>;
  updateHabitStatus: (habitId: string, status: HabitStatus, actualValue?: number) => Promise<void>;
  updateEnergyLevel: (level: number) => Promise<void>;
  saveSleep: (durationHours: number, bedtime: string, wakeTime: string, quality: string) => Promise<void>;
  saveJournalNotes: (notes: string) => Promise<void>;
  saveGoal: (goal: Partial<Goal>) => Promise<void>;
  toggleMilestone: (goalId: string, milestoneId: string) => Promise<void>;
  triggerEmergency: () => Promise<any>;
  refreshAll: () => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [arc, setArc] = useState<Arc | null>(null);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [todayLog, setTodayLog] = useState<DailyLog | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [score, setScore] = useState<number>(82);
  const [scoreBreakdown, setScoreBreakdown] = useState<ScoreBreakdown | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);

  // Initialize demo data for instant demo mode if offline or required
  const enableDemoData = () => {
    setIsDemoMode(true);
    setUser({
      _id: 'alex_vance',
      name: 'Alex Vance',
      email: 'alex@winterarc.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
    });

    const demoStartDate = new Date();
    demoStartDate.setDate(demoStartDate.getDate() - 17);

    setArc({
      _id: 'arc_1',
      userId: 'alex_vance',
      startDate: demoStartDate.toISOString().split('T')[0],
      endDate: new Date(demoStartDate.getTime() + 89 * 86400000).toISOString().split('T')[0],
      currentDay: 17,
      phase: 'Foundation',
      powers: [
        { id: 'mind', name: 'Mind', icon: 'brain', color: '#8BCEFF' },
        { id: 'body', name: 'Body', icon: 'activity', color: '#22C55E' },
        { id: 'future', name: 'Future', icon: 'zap', color: '#F59E0B' }
      ],
      mainGoal: 'Full-Stack MERN Job Ready & Peak Fitness',
      reason: '90 Days of Unbroken Discipline to transform mind and body.',
      signature: 'Alex Vance',
      sleepTarget: { duration: '7h 30m', bedtime: '23:00', wakeTime: '06:30' },
      status: 'active'
    });

    const demoHabits: Habit[] = [
      {
        _id: 'h1',
        name: 'Deep Coding Session',
        powerId: 'future',
        minimum: '30m',
        target: '2h',
        stretch: '4h',
        importance: 'non-negotiable',
        preferredTime: '09:00',
        frequency: 'daily',
        active: true
      },
      {
        _id: 'h2',
        name: 'Strength Workout',
        powerId: 'body',
        minimum: '15m',
        target: '45m',
        stretch: '90m',
        importance: 'non-negotiable',
        preferredTime: '07:00',
        frequency: 'daily',
        active: true
      },
      {
        _id: 'h3',
        name: 'Technical Reading',
        powerId: 'mind',
        minimum: '10 pgs',
        target: '30 pgs',
        stretch: '50 pgs',
        importance: 'regular',
        preferredTime: '21:00',
        frequency: 'daily',
        active: true
      },
      {
        _id: 'h4',
        name: 'Mindfulness & Journal',
        powerId: 'mind',
        minimum: '5m',
        target: '15m',
        stretch: '30m',
        importance: 'regular',
        preferredTime: '06:45',
        frequency: 'daily',
        active: true
      },
      {
        _id: 'h5',
        name: 'Hydration (3L)',
        powerId: 'body',
        minimum: '1.5L',
        target: '3L',
        stretch: '4L',
        importance: 'non-negotiable',
        preferredTime: '12:00',
        frequency: 'daily',
        active: true
      }
    ];

    setHabits(demoHabits);

    const initialResults: HabitResult[] = demoHabits.map((h, index) => {
      let status: HabitStatus = 'NOT_STARTED';
      if (index === 0) status = 'IN_PROGRESS';
      if (index === 1) status = 'TARGET_ACHIEVED';
      if (index === 4) status = 'TARGET_ACHIEVED';

      return {
        habitId: h._id,
        habitName: h.name,
        powerId: h.powerId,
        importance: h.importance,
        minimumCompleted: (status as string) !== 'NOT_STARTED',
        targetCompleted: (status as string) === 'TARGET_ACHIEVED' || (status as string) === 'STRETCH_ACHIEVED',
        stretchCompleted: (status as string) === 'STRETCH_ACHIEVED',
        actualValue: status === 'TARGET_ACHIEVED' ? 2 : (status === 'IN_PROGRESS' ? 0.75 : 0),
        status
      };
    });

    setTodayLog({
      userId: 'alex_vance',
      date: new Date().toISOString().split('T')[0],
      dayNumber: 17,
      habitResults: initialResults,
      sleep: { durationHours: 7.5, bedtime: '23:00', wakeTime: '06:30', quality: 'Good' },
      energy: 3,
      score: 82,
      notes: 'Morning execution went very well. High energy during workout.',
      distractions: [{ category: 'Instagram', durationMinutes: 20 }],
      completed: false
    });

    setGoals([
      {
        _id: 'g1',
        userId: 'alex_vance',
        title: 'Become MERN Job Ready',
        description: 'Master React, Express, Node, MongoDB & deploy full-stack app.',
        powerId: 'future',
        target: '100%',
        progress: 70,
        milestones: [
          { id: 'm1', title: 'Master JavaScript & TS Concepts', completed: true },
          { id: 'm2', title: 'Build REST APIs with Node & Express', completed: true },
          { id: 'm3', title: 'Build Mobile UI with React Native', completed: true },
          { id: 'm4', title: 'Production Deployment & Security', completed: false }
        ]
      },
      {
        _id: 'g2',
        userId: 'alex_vance',
        title: 'Peak Physical Conditioning',
        description: '15% body fat, 7.5h avg sleep, 3L daily hydration.',
        powerId: 'body',
        target: '90 Days',
        progress: 80,
        milestones: [
          { id: 'b1', title: '30 consecutive workout days', completed: true },
          { id: 'b2', title: 'Maintain 7.5h sleep average', completed: true },
          { id: 'b3', title: 'Zero missed hydration days', completed: false }
        ]
      }
    ]);

    setScore(82);
    setScoreBreakdown({
      nonNegotiables: { earned: 38, max: 40 },
      habits: { earned: 20, max: 25 },
      goals: { earned: 12, max: 15 },
      sleep: { earned: 7, max: 10 },
      reflection: { earned: 5, max: 5 },
      routine: { earned: 0, max: 5 }
    });
  };

  const refreshAll = async () => {
    setIsLoading(true);
    try {
      // First attempt backend login with default seed user if no token exists
      const alexRes = await apiRequest('/auth/login', 'POST', {
        email: 'alex@winterarc.com',
        password: 'winterarc123'
      });

      if (alexRes.success && alexRes.token) {
        await setAuthToken(alexRes.token);
        setToken(alexRes.token);
        setUser(alexRes.user);

        const arcRes = await apiRequest('/arc');
        if (arcRes.success) setArc(arcRes.arc);

        const habitsRes = await apiRequest('/habits');
        if (habitsRes.success) setHabits(habitsRes.habits);

        const goalsRes = await apiRequest('/goals');
        if (goalsRes.success) setGoals(goalsRes.goals);

        const todayRes = await apiRequest('/daily/today');
        if (todayRes.success) {
          setTodayLog(todayRes.log);
          setScore(todayRes.score || 82);
          setScoreBreakdown(todayRes.scoreBreakdown || null);
        }
      } else {
        // Fallback to local demo mode
        enableDemoData();
      }
    } catch (err) {
      console.warn('Backend unavailable, initializing demo data:', err);
      enableDemoData();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshAll();
  }, []);

  const login = async (email: string, pass: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await apiRequest('/auth/login', 'POST', { email, password: pass });
      if (res.success && res.token) {
        await setAuthToken(res.token);
        setToken(res.token);
        setUser(res.user);
        await refreshAll();
        return true;
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
    return false;
  };

  const register = async (name: string, email: string, pass: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await apiRequest('/auth/register', 'POST', { name, email, password: pass });
      if (res.success && res.token) {
        await setAuthToken(res.token);
        setToken(res.token);
        setUser(res.user);
        return true;
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
    return false;
  };

  const logout = async () => {
    await AsyncStorage.clear();
    setUser(null);
    setToken(null);
    setArc(null);
    setHabits([]);
    setTodayLog(null);
  };

  const toggleDemoMode = async (enable?: boolean) => {
    if (enable !== undefined) {
      if (enable) enableDemoData();
      else refreshAll();
    } else {
      if (!isDemoMode) enableDemoData();
      else refreshAll();
    }
  };

  const createWinterArc = async (arcData: any): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await apiRequest('/arc', 'POST', arcData);
      if (res.success) {
        await refreshAll();
        return true;
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
    return false;
  };

  const updateHabitStatus = async (habitId: string, status: HabitStatus, actualValue = 0) => {
    if (!todayLog) return;

    const updatedResults = todayLog.habitResults.map(r => {
      if (r.habitId === habitId) {
        return {
          ...r,
          status,
          actualValue,
          minimumCompleted: status === 'MINIMUM_ACHIEVED' || status === 'TARGET_ACHIEVED' || status === 'STRETCH_ACHIEVED',
          targetCompleted: status === 'TARGET_ACHIEVED' || status === 'STRETCH_ACHIEVED',
          stretchCompleted: status === 'STRETCH_ACHIEVED'
        };
      }
      return r;
    });

    const updatedLog = { ...todayLog, habitResults: updatedResults };
    setTodayLog(updatedLog);

    // Save to API
    const dateStr = todayLog.date || new Date().toISOString().split('T')[0];
    const res = await apiRequest(`/daily/log/${dateStr}`, 'PUT', updatedLog);
    if (res.success && res.log) {
      setTodayLog(res.log);
      setScore(res.score || score);
      if (res.scoreBreakdown) setScoreBreakdown(res.scoreBreakdown);
    }
  };

  const updateEnergyLevel = async (level: number) => {
    if (!todayLog) return;
    const updated = { ...todayLog, energy: level };
    setTodayLog(updated);
    const dateStr = todayLog.date || new Date().toISOString().split('T')[0];
    await apiRequest(`/daily/log/${dateStr}`, 'PUT', updated);
  };

  const saveSleep = async (durationHours: number, bedtime: string, wakeTime: string, quality: string) => {
    if (!todayLog) return;
    const sleep = { durationHours, bedtime, wakeTime, quality };
    const updated = { ...todayLog, sleep };
    setTodayLog(updated);
    const dateStr = todayLog.date || new Date().toISOString().split('T')[0];
    await apiRequest(`/daily/log/${dateStr}`, 'PUT', updated);
  };

  const saveJournalNotes = async (notes: string) => {
    if (!todayLog) return;
    const updated = { ...todayLog, notes };
    setTodayLog(updated);
    const dateStr = todayLog.date || new Date().toISOString().split('T')[0];
    await apiRequest(`/daily/log/${dateStr}`, 'PUT', updated);
  };

  const saveGoal = async (goalData: Partial<Goal>) => {
    if (goalData._id) {
      await apiRequest(`/goals/${goalData._id}`, 'PUT', goalData);
    } else {
      await apiRequest('/goals', 'POST', goalData);
    }
    const res = await apiRequest('/goals');
    if (res.success) setGoals(res.goals);
  };

  const toggleMilestone = async (goalId: string, milestoneId: string) => {
    const targetGoal = goals.find(g => g._id === goalId);
    if (!targetGoal) return;

    const updatedMilestones = targetGoal.milestones.map(m => {
      if (m.id === milestoneId) return { ...m, completed: !m.completed };
      return m;
    });

    const completedCount = updatedMilestones.filter(m => m.completed).length;
    const progress = Math.round((completedCount / updatedMilestones.length) * 100);

    const updated = { ...targetGoal, milestones: updatedMilestones, progress };

    setGoals(goals.map(g => g._id === goalId ? updated : g));

    await apiRequest(`/goals/${goalId}`, 'PUT', { milestones: updatedMilestones, progress });
  };

  const triggerEmergency = async () => {
    const res = await apiRequest('/daily/emergency');
    if (res.success) {
      return res.emergencyRoutine;
    }
    return null;
  };

  return (
    <AppContext.Provider
      value={{
        user,
        token,
        arc,
        habits,
        todayLog,
        goals,
        score,
        scoreBreakdown,
        isLoading,
        isDemoMode,
        login,
        register,
        logout,
        toggleDemoMode,
        createWinterArc,
        updateHabitStatus,
        updateEnergyLevel,
        saveSleep,
        saveJournalNotes,
        saveGoal,
        toggleMilestone,
        triggerEmergency,
        refreshAll
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
