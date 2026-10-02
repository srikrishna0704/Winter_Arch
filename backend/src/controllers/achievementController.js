import { getDb } from '../config/db.js';

const AchievementDb = getDb('achievements');
const DailyLogDb = getDb('daily_logs');
const ArcDb = getDb('arcs');

const ALL_ACHIEVEMENTS = [
  { id: 'first_step', title: 'FIRST STEP', description: 'Completed Day 1 of Winter Arc', icon: 'zap' },
  { id: 'foundation_7', title: '7 DAY FOUNDATION', description: 'Completed 7 consecutive days', icon: 'shield' },
  { id: 'zero_day_defender', title: 'ZERO DAY DEFENDER', description: 'Completed minimums for 14 days without zero days', icon: 'award' },
  { id: 'early_riser', title: 'EARLY RISER', description: 'Completed morning routine 10 times', icon: 'sun' },
  { id: 'discipline_30', title: 'DISCIPLINE', description: 'Completed Phase 1 (30 Days)', icon: 'flame' },
  { id: 'halfway_45', title: 'HALFWAY', description: 'Reached Day 45 milestone', icon: 'target' },
  { id: 'unbreakable_60', title: 'UNBREAKABLE', description: 'Completed Phase 2 (60 Days)', icon: 'lock' },
  { id: 'final_push_90', title: 'FINAL PUSH', description: 'Completed full 90-Day Winter Arc', icon: 'trophy' }
];

export const getAchievements = (req, res) => {
  try {
    const unlocked = AchievementDb.find({ userId: req.userId });
    const arc = ArcDb.findOne({ userId: req.userId, status: 'active' });
    const logs = DailyLogDb.find({ userId: req.userId });

    const currentDay = arc ? arc.currentDay : logs.length;
    const unlockedIds = new Set(unlocked.map(u => u.achievementId));

    // Auto-check unlocks based on progress
    const checkAndUnlock = (achId) => {
      if (!unlockedIds.has(achId)) {
        const doc = AchievementDb.insertOne({
          userId: req.userId,
          achievementId: achId,
          unlockedAt: new Date().toISOString()
        });
        unlockedIds.add(achId);
        unlocked.push(doc);
      }
    };

    if (logs.length >= 1) checkAndUnlock('first_step');
    if (logs.length >= 7) checkAndUnlock('foundation_7');
    if (logs.length >= 14) checkAndUnlock('zero_day_defender');
    if (currentDay >= 30) checkAndUnlock('discipline_30');
    if (currentDay >= 45) checkAndUnlock('halfway_45');
    if (currentDay >= 60) checkAndUnlock('unbreakable_60');
    if (currentDay >= 90) checkAndUnlock('final_push_90');

    const result = ALL_ACHIEVEMENTS.map(ach => {
      const uDoc = unlocked.find(u => u.achievementId === ach.id);
      return {
        ...ach,
        unlocked: !!uDoc,
        unlockedAt: uDoc ? uDoc.unlockedAt : null
      };
    });

    res.json({ success: true, achievements: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
