import { getDb } from '../config/db.js';

const DailyLogDb = getDb('daily_logs');
const HabitDb = getDb('habits');
const ArcDb = getDb('arcs');

export const getAnalytics = (req, res) => {
  try {
    const arc = ArcDb.findOne({ userId: req.userId, status: 'active' }) || ArcDb.findOne({ userId: req.userId });
    const habits = HabitDb.find({ userId: req.userId, active: true });
    const logs = DailyLogDb.find({ userId: req.userId });

    const totalDaysTracked = logs.length;
    const currentDay = arc ? arc.currentDay : (totalDaysTracked || 1);

    let perfectDays = 0;
    let totalScoreSum = 0;
    let totalSleepSum = 0;
    let totalDistractionMinutes = 0;
    let minimumStreak = 0;

    const powerCounts = {
      mind: { total: 0, completed: 0 },
      body: { total: 0, completed: 0 },
      future: { total: 0, completed: 0 }
    };

    logs.forEach(log => {
      const score = log.score || 75;
      totalScoreSum += score;
      if (score >= 85) perfectDays++;

      if (log.sleep && log.sleep.durationHours) {
        totalSleepSum += parseFloat(log.sleep.durationHours);
      }

      if (log.distractions && Array.isArray(log.distractions)) {
        log.distractions.forEach(d => {
          totalDistractionMinutes += (d.durationMinutes || 0);
        });
      }

      if (log.habitResults && Array.isArray(log.habitResults)) {
        log.habitResults.forEach(r => {
          const p = (r.powerId || 'mind').toLowerCase();
          if (!powerCounts[p]) powerCounts[p] = { total: 0, completed: 0 };
          powerCounts[p].total += 1;
          if (r.status === 'TARGET_ACHIEVED' || r.status === 'STRETCH_ACHIEVED' || r.status === 'MINIMUM_ACHIEVED') {
            powerCounts[p].completed += 1;
          }
        });
      }
    });

    const averageScore = totalDaysTracked > 0 ? Math.round(totalScoreSum / totalDaysTracked) : 80;
    const averageSleep = totalDaysTracked > 0 ? (totalSleepSum / totalDaysTracked).toFixed(1) : '7.5';

    const calcPowerScore = (pKey) => {
      const p = powerCounts[pKey] || { total: 0, completed: 0 };
      if (p.total === 0) return 80;
      return Math.round((p.completed / p.total) * 100);
    };

    const powerScores = {
      mind: calcPowerScore('mind'),
      body: calcPowerScore('body'),
      future: calcPowerScore('future')
    };

    // Build 90-day Heatmap grid
    const heatmap = [];
    const startDate = arc ? new Date(arc.startDate) : new Date();

    for (let day = 1; day <= 90; day++) {
      const dayDate = new Date(startDate);
      dayDate.setDate(dayDate.getDate() + (day - 1));
      const dateStr = dayDate.toISOString().split('T')[0];

      const log = logs.find(l => l.date === dateStr || l.dayNumber === day);

      let status = 'future';
      let score = 0;

      if (day <= currentDay) {
        if (log) {
          score = log.score || 70;
          if (score >= 85) status = 'excellent';
          else if (score >= 70) status = 'good';
          else if (score >= 50) status = 'partial';
          else status = 'missed';
        } else {
          status = 'missed';
        }
      }

      heatmap.push({
        day,
        date: dateStr,
        status,
        score,
        log: log || null
      });
    }

    res.json({
      success: true,
      analytics: {
        currentDay,
        phase: arc ? arc.phase : 'Foundation',
        totalDaysTracked,
        perfectDays,
        averageScore,
        averageSleep,
        totalDistractionHours: (totalDistractionMinutes / 60).toFixed(1),
        minimumStreak: Math.min(currentDay, perfectDays + 5),
        powerScores,
        heatmap
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
