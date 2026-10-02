import { getDb } from '../config/db.js';

const TrackerDb = getDb('monthly_trackers');

export const getMonthTracker = (req, res) => {
  try {
    const { monthKey } = req.params; // e.g. "2026-10"
    const userId = req.userId || 'alex_vance';

    let tracker = TrackerDb.findOne({ userId, monthKey });

    if (!tracker) {
      // Return clean fresh monthly tracker template
      const defaultHabits = [
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
      ];

      tracker = TrackerDb.insertOne({
        userId,
        monthKey,
        name: 'Alex Vance',
        startDate: `${monthKey}-01`,
        habits: defaultHabits,
        habitGrid: {},
        sleepGrid: {},
        monthlyGoal: '',
        goalDetails: {
          title: '',
          description: '',
          steps: [],
          strategy: '',
          targetDate: ''
        },
        achievedThisMonth: '',
        shouldImprove: ''
      });
    }

    res.json({ success: true, tracker });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const saveMonthTracker = (req, res) => {
  try {
    const { monthKey } = req.params;
    const userId = req.userId || 'alex_vance';

    let tracker = TrackerDb.findOne({ userId, monthKey });

    if (!tracker) {
      tracker = TrackerDb.insertOne({
        userId,
        monthKey,
        ...req.body
      });
    } else {
      tracker = TrackerDb.updateById(tracker._id, req.body);
    }

    res.json({ success: true, tracker });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getAllMonths = (req, res) => {
  try {
    const userId = req.userId || 'alex_vance';
    const trackers = TrackerDb.find({ userId });
    const months = trackers.map(t => t.monthKey);
    res.json({ success: true, months });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
