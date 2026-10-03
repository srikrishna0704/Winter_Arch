import { getDb } from '../config/db.js';

const TrackerDb = getDb('monthly_trackers');

export const getMonthTracker = async (req, res) => {
  try {
    const { monthKey } = req.params; // e.g. "2026-10"
    const userId = req.userId || 'user_gmail_srikrishna_gmail_com';

    let tracker = await TrackerDb.findOne({ userId, monthKey });

    if (!tracker) {
      let userName = 'Achiever';
      if (req.userId) {
        try {
          const UserDb = getDb('users');
          const user = await UserDb.findById(req.userId);
          if (user && user.name) {
            userName = user.name;
          }
        } catch (e) {
          console.warn('User lookup warning:', e);
        }
      }

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

      tracker = await TrackerDb.insertOne({
        userId,
        monthKey,
        name: userName,
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

export const saveMonthTracker = async (req, res) => {
  try {
    const { monthKey } = req.params;
    const userId = req.userId || 'user_gmail_srikrishna_gmail_com';

    const payload = {
      userId,
      monthKey,
      ...req.body
    };

    const tracker = await TrackerDb.updateOne({ userId, monthKey }, payload);

    res.json({ success: true, tracker });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getAllMonths = async (req, res) => {
  try {
    const userId = req.userId || 'user_gmail_srikrishna_gmail_com';
    const trackers = await TrackerDb.find({ userId });
    const months = trackers.map(t => t.monthKey);
    res.json({ success: true, months });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
