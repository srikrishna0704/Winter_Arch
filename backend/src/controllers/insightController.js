import { getDb } from '../config/db.js';

const DailyLogDb = getDb('daily_logs');
const InsightDb = getDb('insights');
const HabitDb = getDb('habits');

export const getInsights = (req, res) => {
  try {
    const logs = DailyLogDb.find({ userId: req.userId });

    if (logs.length < 2) {
      return res.json({
        success: true,
        insights: [],
        message: 'Not enough data yet. Keep tracking for a few more days to reveal performance patterns.'
      });
    }

    const insights = [];

    // Analyze evening vs morning completion rate
    let morningCompleted = 0;
    let morningTotal = 0;
    let eveningCompleted = 0;
    let eveningTotal = 0;

    const habits = HabitDb.find({ userId: req.userId });

    logs.forEach(log => {
      (log.habitResults || []).forEach(r => {
        const h = habits.find(habit => habit._id === r.habitId);
        const prefTime = h ? (h.preferredTime || '12:00') : '12:00';
        const hour = parseInt(prefTime.split(':')[0], 10);

        if (hour < 15) {
          morningTotal++;
          if (r.status === 'TARGET_ACHIEVED' || r.status === 'STRETCH_ACHIEVED') morningCompleted++;
        } else {
          eveningTotal++;
          if (r.status === 'TARGET_ACHIEVED' || r.status === 'STRETCH_ACHIEVED') eveningCompleted++;
        }
      });
    });

    if (morningTotal > 0 && eveningTotal > 0) {
      const morningRate = Math.round((morningCompleted / morningTotal) * 100);
      const eveningRate = Math.round((eveningCompleted / eveningTotal) * 100);

      if (morningRate > eveningRate + 15) {
        insights.push({
          id: 'timing_pattern_1',
          type: 'pattern',
          title: 'TIMING OPTIMIZATION DETECTED',
          content: `You complete morning habits (${morningRate}%) significantly more consistently than evening habits (${eveningRate}%). Shift non-negotiable tasks before 3 PM for maximum execution rate.`,
          data: { morningRate, eveningRate }
        });
      }
    }

    // Sleep vs Performance correlation
    let highSleepScores = [];
    let lowSleepScores = [];

    logs.forEach(log => {
      const sleepH = log.sleep ? parseFloat(log.sleep.durationHours || 7) : 7;
      if (sleepH >= 7.5) highSleepScores.push(log.score || 70);
      else if (sleepH < 6.5) lowSleepScores.push(log.score || 70);
    });

    if (highSleepScores.length > 0 && lowSleepScores.length > 0) {
      const avgHigh = Math.round(highSleepScores.reduce((a, b) => a + b, 0) / highSleepScores.length);
      const avgLow = Math.round(lowSleepScores.reduce((a, b) => a + b, 0) / lowSleepScores.length);

      if (avgHigh > avgLow) {
        const diff = avgHigh - avgLow;
        insights.push({
          id: 'sleep_performance_1',
          type: 'correlation',
          title: 'SLEEP-PERFORMANCE CORRELATION',
          content: `Your daily discipline score is ${diff}% higher on days following 7.5+ hours of sleep (${avgHigh} vs ${avgLow}). Sleep is your highest leverage multiplier.`,
          data: { avgHigh, avgLow, diff }
        });
      }
    }

    // Frequently Missed Habit detector
    const missCounts = {};
    logs.forEach(log => {
      (log.habitResults || []).forEach(r => {
        if (r.status === 'MISSED' || r.status === 'NOT_STARTED') {
          missCounts[r.habitName || r.habitId] = (missCounts[r.habitName || r.habitId] || 0) + 1;
        }
      });
    });

    Object.entries(missCounts).forEach(([name, count]) => {
      if (count >= 3) {
        insights.push({
          id: `frequent_miss_${name}`,
          type: 'warning',
          title: 'RECURRING FRICTION DETECTED',
          content: `"${name}" was missed ${count} times recently. Your current target may be unrealistic for your current capacity. Consider reducing the target or changing execution window.`,
          data: { habitName: name, missCount: count }
        });
      }
    });

    res.json({ success: true, insights });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const generateDailyReview = (req, res) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const log = DailyLogDb.findOne({ userId: req.userId, date: todayStr }) || DailyLogDb.find({ userId: req.userId }).pop();

    if (!log) {
      return res.status(404).json({ success: false, message: 'No daily log available to generate review' });
    }

    const completed = (log.habitResults || []).filter(r => r.status === 'TARGET_ACHIEVED' || r.status === 'STRETCH_ACHIEVED' || r.status === 'MINIMUM_ACHIEVED');
    const missed = (log.habitResults || []).filter(r => r.status === 'MISSED' || r.status === 'NOT_STARTED');

    const review = {
      dayNumber: log.dayNumber || 1,
      score: log.score || 80,
      whatWentWell: completed.length > 0
        ? `Executed ${completed.length} habits successfully including ${completed[0].habitName}.`
        : 'Maintained awareness and logged your day.',
      whatFailed: missed.length > 0
        ? `Fell behind on ${missed.map(m => m.habitName).join(', ')}.`
        : 'Zero major execution failures today.',
      pattern: log.sleep && log.sleep.durationHours >= 7
        ? 'Rest level supported focus throughout peak working hours.'
        : 'Sleep debt caused late afternoon friction.',
      tomorrowPriority: missed.length > 0
        ? `Priority 1 tomorrow: Complete minimum for ${missed[0].habitName} before 10 AM.`
        : 'Protect momentum. Execute deep work block first thing in morning.'
    };

    res.json({ success: true, review });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
