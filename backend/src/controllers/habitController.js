import { getDb } from '../config/db.js';

const HabitDb = getDb('habits');

export const getHabits = (req, res) => {
  try {
    const habits = HabitDb.find({ userId: req.userId, active: true });
    res.json({ success: true, habits });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createHabit = (req, res) => {
  try {
    const { name, powerId, minimum, target, stretch, importance, preferredTime, frequency, category } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Habit name is required' });
    }

    const habit = HabitDb.insertOne({
      userId: req.userId,
      name,
      powerId: powerId || 'mind',
      category: category || 'General',
      minimum: minimum || '15m',
      target: target || '45m',
      stretch: stretch || '90m',
      importance: importance || 'regular',
      preferredTime: preferredTime || '08:00',
      frequency: frequency || 'daily',
      active: true
    });

    res.status(201).json({ success: true, habit });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateHabit = (req, res) => {
  try {
    const { id } = req.params;
    const updated = HabitDb.updateById(id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Habit not found' });
    }
    res.json({ success: true, habit: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteHabit = (req, res) => {
  try {
    const { id } = req.params;
    const updated = HabitDb.updateById(id, { active: false });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Habit not found' });
    }
    res.json({ success: true, message: 'Habit deactivated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
