export type PowerType = 'mind' | 'body' | 'future' | string;

export interface Power {
  id: PowerType;
  name: string;
  icon: string;
  color?: string;
}

export type HabitImportance = 'non-negotiable' | 'high' | 'regular';

export type HabitStatus = 
  | 'NOT_STARTED'
  | 'IN_PROGRESS'
  | 'MINIMUM_ACHIEVED'
  | 'TARGET_ACHIEVED'
  | 'STRETCH_ACHIEVED'
  | 'MISSED'
  | 'SKIPPED';

export interface Habit {
  _id: string;
  userId?: string;
  name: string;
  powerId: PowerType;
  category?: string;
  minimum: string;
  target: string;
  stretch: string;
  importance: HabitImportance;
  preferredTime: string;
  frequency: string;
  active: boolean;
}

export interface HabitResult {
  habitId: string;
  habitName: string;
  powerId: PowerType;
  importance: HabitImportance;
  minimumCompleted: boolean;
  targetCompleted: boolean;
  stretchCompleted: boolean;
  actualValue: number;
  status: HabitStatus;
}

export interface SleepData {
  durationHours: number;
  bedtime: string;
  wakeTime: string;
  quality: string;
}

export interface DistractionData {
  category: string;
  durationMinutes: number;
}

export interface ScoreBreakdown {
  nonNegotiables: { earned: number; max: number };
  habits: { earned: number; max: number };
  goals: { earned: number; max: number };
  sleep: { earned: number; max: number };
  reflection: { earned: number; max: number };
  routine: { earned: number; max: number };
}

export interface DailyLog {
  _id?: string;
  userId: string;
  date: string;
  dayNumber: number;
  habitResults: HabitResult[];
  sleep: SleepData;
  energy: number; // 1-5
  score: number;
  notes: string;
  distractions: DistractionData[];
  completed: boolean;
}

export interface GoalMilestone {
  id: string;
  title: string;
  completed: boolean;
}

export interface Goal {
  _id: string;
  userId: string;
  title: string;
  description?: string;
  powerId: PowerType;
  target: string;
  progress: number; // 0-100
  milestones: GoalMilestone[];
}

export interface Arc {
  _id?: string;
  userId: string;
  startDate: string;
  endDate: string;
  currentDay: number;
  phase: 'Foundation' | 'Discipline' | 'Transformation';
  powers: Power[];
  mainGoal: string;
  reason: string;
  signature: string;
  sleepTarget: { duration: string; bedtime: string; wakeTime: string };
  status: 'active' | 'completed';
}

export interface Insight {
  id: string;
  type: 'pattern' | 'correlation' | 'warning' | 'recommendation';
  title: string;
  content: string;
  data?: any;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string | null;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
}
