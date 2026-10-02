import express from 'express';
import { protect, optionalAuth } from '../middleware/auth.js';
import * as authCtrl from '../controllers/authController.js';
import * as arcCtrl from '../controllers/arcController.js';
import * as habitCtrl from '../controllers/habitController.js';
import * as goalCtrl from '../controllers/goalController.js';
import * as dailyCtrl from '../controllers/dailyController.js';
import * as analyticsCtrl from '../controllers/analyticsController.js';
import * as insightCtrl from '../controllers/insightController.js';
import * as achievementCtrl from '../controllers/achievementController.js';
import * as trackerCtrl from '../controllers/trackerController.js';

const router = express.Router();

// Auth routes
router.post('/auth/register', authCtrl.register);
router.post('/auth/login', authCtrl.login);
router.post('/auth/google', authCtrl.googleLogin);
router.get('/auth/me', protect, authCtrl.getMe);

// Monthly Tracker routes
router.get('/tracker/months', optionalAuth, trackerCtrl.getAllMonths);
router.get('/tracker/:monthKey', optionalAuth, trackerCtrl.getMonthTracker);
router.post('/tracker/:monthKey', optionalAuth, trackerCtrl.saveMonthTracker);


// Arc routes
router.get('/arc', protect, arcCtrl.getArc);
router.post('/arc', protect, arcCtrl.createArc);
router.put('/arc', protect, arcCtrl.updateArc);

// Habits routes
router.get('/habits', protect, habitCtrl.getHabits);
router.post('/habits', protect, habitCtrl.createHabit);
router.put('/habits/:id', protect, habitCtrl.updateHabit);
router.delete('/habits/:id', protect, habitCtrl.deleteHabit);

// Goals routes
router.get('/goals', protect, goalCtrl.getGoals);
router.post('/goals', protect, goalCtrl.createGoal);
router.put('/goals/:id', protect, goalCtrl.updateGoal);
router.delete('/goals/:id', protect, goalCtrl.deleteGoal);

// Daily routes
router.get('/daily/today', protect, dailyCtrl.getTodayLog);
router.post('/daily/log', protect, dailyCtrl.saveDailyLog);
router.put('/daily/log/:date', protect, dailyCtrl.saveDailyLog);
router.get('/daily/emergency', protect, dailyCtrl.triggerEmergencyRoutine);
router.get('/daily/history', protect, dailyCtrl.getHistory);

// Analytics & Insights & Achievements
router.get('/analytics/dashboard', protect, analyticsCtrl.getAnalytics);
router.get('/insights', protect, insightCtrl.getInsights);
router.get('/insights/daily-review', protect, insightCtrl.generateDailyReview);
router.get('/achievements', protect, achievementCtrl.getAchievements);

export default router;
