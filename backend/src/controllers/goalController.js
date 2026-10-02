import { getDb } from '../config/db.js';

const GoalDb = getDb('goals');

export const getGoals = (req, res) => {
  try {
    const goals = GoalDb.find({ userId: req.userId });
    res.json({ success: true, goals });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createGoal = (req, res) => {
  try {
    const { title, description, powerId, target, milestones } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Goal title is required' });
    }

    const goal = GoalDb.insertOne({
      userId: req.userId,
      title,
      description: description || '',
      powerId: powerId || 'future',
      target: target || '100%',
      progress: 0,
      milestones: milestones || []
    });

    res.status(201).json({ success: true, goal });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateGoal = (req, res) => {
  try {
    const { id } = req.params;
    const goal = GoalDb.findById(id);
    if (!goal) {
      return res.status(404).json({ success: false, message: 'Goal not found' });
    }

    const updated = GoalDb.updateById(id, req.body);

    // Recalculate progress if milestones modified
    if (updated.milestones && updated.milestones.length > 0) {
      const completed = updated.milestones.filter(m => m.completed).length;
      const progress = Math.round((completed / updated.milestones.length) * 100);
      GoalDb.updateById(id, { progress });
      updated.progress = progress;
    }

    res.json({ success: true, goal: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteGoal = (req, res) => {
  try {
    const { id } = req.params;
    GoalDb.deleteOne({ _id: id });
    res.json({ success: true, message: 'Goal deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
