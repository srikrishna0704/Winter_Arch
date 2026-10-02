import { getDb } from '../config/db.js';

const ArcDb = getDb('arcs');
const HabitDb = getDb('habits');
const GoalDb = getDb('goals');

export const getArc = (req, res) => {
  try {
    const arc = ArcDb.findOne({ userId: req.userId, status: 'active' }) || ArcDb.findOne({ userId: req.userId });

    if (!arc) {
      return res.status(404).json({ success: false, message: 'No active Winter Arc found' });
    }

    // Calculate current day and phase
    const start = new Date(arc.startDate);
    const today = new Date();
    const diffTime = Math.abs(today - start);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    const currentDay = Math.min(Math.max(diffDays, 1), 90);

    let phase = 'Foundation';
    if (currentDay > 60) phase = 'Transformation';
    else if (currentDay > 30) phase = 'Discipline';

    const updatedArc = ArcDb.updateById(arc._id, { currentDay, phase });

    res.json({ success: true, arc: updatedArc || arc });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createArc = (req, res) => {
  try {
    const { powers, mainGoal, reason, signature, habits, sleepTarget, nonNegotiables } = req.body;

    const startDate = new Date().toISOString().split('T')[0];
    const end = new Date();
    end.setDate(end.getDate() + 89);
    const endDate = end.toISOString().split('T')[0];

    // Deactivate existing arcs
    const existing = ArcDb.find({ userId: req.userId });
    existing.forEach(a => ArcDb.updateById(a._id, { status: 'completed' }));

    const arc = ArcDb.insertOne({
      userId: req.userId,
      startDate,
      endDate,
      currentDay: 1,
      phase: 'Foundation',
      powers: powers || [
        { id: 'mind', name: 'Mind', icon: 'brain' },
        { id: 'body', name: 'Body', icon: 'activity' },
        { id: 'future', name: 'Future', icon: 'zap' }
      ],
      mainGoal: mainGoal || '90-Day Transformation',
      reason: reason || 'Become the best version of myself.',
      signature: signature || 'Signed',
      sleepTarget: sleepTarget || { duration: '7h 30m', bedtime: '23:00', wakeTime: '06:30' },
      status: 'active'
    });

    // Create initial habits if provided
    if (habits && Array.isArray(habits)) {
      HabitDb.deleteMany({ userId: req.userId });
      habits.forEach(h => {
        HabitDb.insertOne({
          userId: req.userId,
          name: h.name,
          powerId: h.powerId || 'mind',
          category: h.category || 'General',
          minimum: h.minimum || '15m',
          target: h.target || '45m',
          stretch: h.stretch || '90m',
          importance: h.importance || 'regular',
          preferredTime: h.preferredTime || '08:00',
          frequency: 'daily',
          active: true
        });
      });
    }

    res.status(201).json({ success: true, arc });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateArc = (req, res) => {
  try {
    const arc = ArcDb.findOne({ userId: req.userId, status: 'active' });
    if (!arc) {
      return res.status(404).json({ success: false, message: 'Arc not found' });
    }

    const updated = ArcDb.updateById(arc._id, req.body);
    res.json({ success: true, arc: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
