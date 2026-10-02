import { getDb } from '../config/db.js';

const DailyLogDb = getDb('daily_logs');
const HabitDb = getDb('habits');
const ArcDb = getDb('arcs');
const GoalDb = getDb('goals');

export const calculateDailyScore = (habitResults = [], habits = [], sleep = {}, energy = 3, notes = '', goals = []) => {
  let nonNegPoints = 0;
  let nonNegTotal = 0;
  let regularPoints = 0;
  let regularTotal = 0;

  habits.forEach(h => {
    const result = habitResults.find(r => r.habitId === h._id) || { status: 'NOT_STARTED' };
    const status = result.status;
    let scoreMultiplier = 0;

    if (status === 'STRETCH_ACHIEVED') scoreMultiplier = 1.0;
    else if (status === 'TARGET_ACHIEVED') scoreMultiplier = 0.95;
    else if (status === 'MINIMUM_ACHIEVED') scoreMultiplier = 0.75;
    else if (status === 'IN_PROGRESS') scoreMultiplier = 0.4;
    else scoreMultiplier = 0;

    if (h.importance === 'non-negotiable') {
      nonNegTotal += 1;
      nonNegPoints += scoreMultiplier;
    } else {
      regularTotal += 1;
      regularPoints += scoreMultiplier;
    }
  });

  const nonNegScore = nonNegTotal > 0 ? Math.round((nonNegPoints / nonNegTotal) * 40) : 40;
  const regularScore = regularTotal > 0 ? Math.round((regularPoints / regularTotal) * 25) : 25;

  // Goals score (15 points)
  const completedGoalsCount = goals.filter(g => g.progress >= 100).length;
  const goalScore = goals.length > 0 ? Math.min(15, Math.round((completedGoalsCount / goals.length) * 15) + 10) : 12;

  // Sleep score (10 points)
  let sleepScore = 0;
  const sleepHours = parseFloat(sleep.durationHours || 7);
  if (sleepHours >= 7 && sleepHours <= 9) sleepScore = 10;
  else if (sleepHours >= 6) sleepScore = 7;
  else if (sleepHours >= 5) sleepScore = 5;
  else sleepScore = 2;

  // Reflection score (5 points)
  const reflectionScore = (notes && notes.length > 10) ? 5 : (notes ? 3 : 0);

  // Routine consistency (5 points)
  const routineScore = (energy >= 3 && (nonNegScore + regularScore) > 40) ? 5 : 3;

  const totalScore = Math.min(100, nonNegScore + regularScore + goalScore + sleepScore + reflectionScore + routineScore);

  return {
    totalScore,
    breakdown: {
      nonNegotiables: { earned: nonNegScore, max: 40 },
      habits: { earned: regularScore, max: 25 },
      goals: { earned: goalScore, max: 15 },
      sleep: { earned: sleepScore, max: 10 },
      reflection: { earned: reflectionScore, max: 5 },
      routine: { earned: routineScore, max: 5 }
    }
  };
};

export const getTodayLog = (req, res) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const habits = HabitDb.find({ userId: req.userId, active: true });
    const arc = ArcDb.findOne({ userId: req.userId, status: 'active' });
    const goals = GoalDb.find({ userId: req.userId });

    let log = DailyLogDb.findOne({ userId: req.userId, date: todayStr });

    if (!log) {
      // Initialize fresh log for today
      const defaultResults = habits.map(h => ({
        habitId: h._id,
        habitName: h.name,
        powerId: h.powerId,
        importance: h.importance,
        minimumCompleted: false,
        targetCompleted: false,
        stretchCompleted: false,
        actualValue: 0,
        status: 'NOT_STARTED'
      }));

      log = DailyLogDb.insertOne({
        userId: req.userId,
        date: todayStr,
        dayNumber: arc ? arc.currentDay : 1,
        habitResults: defaultResults,
        sleep: { durationHours: 7.5, bedtime: '23:00', wakeTime: '06:30', quality: 'Good' },
        energy: 3,
        notes: '',
        distractions: [],
        completed: false
      });
    } else {
      // Synchronize any new active habits that aren't in habitResults yet
      const existingIds = new Set(log.habitResults.map(r => r.habitId));
      let modified = false;
      habits.forEach(h => {
        if (!existingIds.has(h._id)) {
          log.habitResults.push({
            habitId: h._id,
            habitName: h.name,
            powerId: h.powerId,
            importance: h.importance,
            minimumCompleted: false,
            targetCompleted: false,
            stretchCompleted: false,
            actualValue: 0,
            status: 'NOT_STARTED'
          });
          modified = true;
        }
      });
      if (modified) {
        DailyLogDb.updateById(log._id, { habitResults: log.habitResults });
      }
    }

    const scoreData = calculateDailyScore(log.habitResults, habits, log.sleep, log.energy, log.notes, goals);

    res.json({
      success: true,
      log,
      habits,
      arc,
      score: scoreData.totalScore,
      scoreBreakdown: scoreData.breakdown
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const saveDailyLog = (req, res) => {
  try {
    const todayStr = req.params.date || new Date().toISOString().split('T')[0];
    let log = DailyLogDb.findOne({ userId: req.userId, date: todayStr });

    const habits = HabitDb.find({ userId: req.userId, active: true });
    const goals = GoalDb.find({ userId: req.userId });

    if (!log) {
      log = DailyLogDb.insertOne({
        userId: req.userId,
        date: todayStr,
        ...req.body
      });
    } else {
      log = DailyLogDb.updateById(log._id, req.body);
    }

    const scoreData = calculateDailyScore(log.habitResults, habits, log.sleep, log.energy, log.notes, goals);
    log = DailyLogDb.updateById(log._id, { score: scoreData.totalScore });

    res.json({
      success: true,
      log,
      score: scoreData.totalScore,
      scoreBreakdown: scoreData.breakdown
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const triggerEmergencyRoutine = (req, res) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const log = DailyLogDb.findOne({ userId: req.userId, date: todayStr });
    const habits = HabitDb.find({ userId: req.userId, active: true });

    if (!log) {
      return res.status(404).json({ success: false, message: 'No daily log found for today' });
    }

    const incomplete = log.habitResults.filter(r => r.status === 'NOT_STARTED' || r.status === 'IN_PROGRESS');
    const emergencyTasks = incomplete.map(r => {
      const h = habits.find(habit => habit._id === r.habitId) || {};
      return {
        habitId: r.habitId,
        habitName: r.habitName || h.name,
        originalMinimum: h.minimum || '30m',
        emergencyTarget: '10m / 5 pgs',
        instructions: 'Micro-minimum target to preserve consistency and prevent zero days.'
      };
    });

    res.json({
      success: true,
      emergencyRoutine: {
        title: 'YOUR DAY IS NOT OVER',
        message: 'Execute micro-minimums before sleep to keep your identity intact.',
        tasks: emergencyTasks
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getHistory = (req, res) => {
  try {
    const logs = DailyLogDb.find({ userId: req.userId });
    res.json({ success: true, logs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
