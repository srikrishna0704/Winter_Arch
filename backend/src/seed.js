import bcrypt from 'bcryptjs';
import { getDb } from './config/db.js';

export const seedDatabase = async () => {
  const UserDb = getDb('users');
  const ArcDb = getDb('arcs');
  const HabitDb = getDb('habits');
  const GoalDb = getDb('goals');
  const DailyLogDb = getDb('daily_logs');

  try {
    if (process.env.SEED_DEMO !== 'true') {
      console.log('Skipping auto-seeding to keep database fresh for new sign ups.');
      return null;
    }

    console.log('Seeding Winter Arc demo data...');

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync('winterarc123', salt);

    const alex = await UserDb.insertOne({
      name: 'Alex Vance',
      email: 'alex@winterarc.com',
      passwordHash,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      timezone: 'America/New_York'
    });

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 17); // Day 17 of 90
    const startDateStr = startDate.toISOString().split('T')[0];

    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 89);
    const endDateStr = endDate.toISOString().split('T')[0];

    await ArcDb.insertOne({
      userId: alex._id || alex.id,
      startDate: startDateStr,
      endDate: endDateStr,
      currentDay: 17,
      phase: 'Foundation',
      powers: [
        { id: 'mind', name: 'Mind', icon: 'brain', color: '#8BCEFF' },
        { id: 'body', name: 'Body', icon: 'activity', color: '#22C55E' },
        { id: 'future', name: 'Future', icon: 'zap', color: '#F59E0B' }
      ],
      mainGoal: 'Become Full-Stack MERN Job Ready & Build Peak Physical Discipline',
      reason: 'Eliminate zero days, optimize focus, and emerge transformed in 90 days.',
      signature: 'Alex Vance',
      sleepTarget: { duration: '7h 30m', bedtime: '23:00', wakeTime: '06:30' },
      status: 'active'
    });

    // Create core habits with Min / Target / Stretch
    const habits = [
      {
        name: 'Deep Coding Session',
        powerId: 'future',
        category: 'Skill',
        minimum: '30m',
        target: '2h',
        stretch: '4h',
        importance: 'non-negotiable',
        preferredTime: '09:00',
        frequency: 'daily'
      },
      {
        name: 'Strength Workout',
        powerId: 'body',
        category: 'Fitness',
        minimum: '15m',
        target: '45m',
        stretch: '90m',
        importance: 'non-negotiable',
        preferredTime: '07:00',
        frequency: 'daily'
      },
      {
        name: 'Technical Reading',
        powerId: 'mind',
        category: 'Knowledge',
        minimum: '10 pgs',
        target: '30 pgs',
        stretch: '50 pgs',
        importance: 'regular',
        preferredTime: '21:00',
        frequency: 'daily'
      },
      {
        name: 'Mindfulness & Journaling',
        powerId: 'mind',
        category: 'Mindset',
        minimum: '5m',
        target: '15m',
        stretch: '30m',
        importance: 'regular',
        preferredTime: '06:45',
        frequency: 'daily'
      },
      {
        name: 'Hydration (3L)',
        powerId: 'body',
        category: 'Health',
        minimum: '1.5L',
        target: '3L',
        stretch: '4L',
        importance: 'non-negotiable',
        preferredTime: '12:00',
        frequency: 'daily'
      },
      {
        name: 'Portfolio Project Dev',
        powerId: 'future',
        category: 'Career',
        minimum: '20m',
        target: '1h',
        stretch: '2h',
        importance: 'regular',
        preferredTime: '15:00',
        frequency: 'daily'
      }
    ];

    const insertedHabits = [];
    for (const h of habits) {
      const inserted = await HabitDb.insertOne({ userId: alex._id || alex.id, active: true, ...h });
      insertedHabits.push(inserted);
    }

    // Create Goals
    await GoalDb.insertOne({
      userId: alex._id || alex.id,
      title: 'Become MERN Job Ready',
      description: 'Master React, Express, Node, MongoDB and deploy 2 production projects.',
      powerId: 'future',
      target: '100%',
      progress: 65,
      milestones: [
        { id: 'm1', title: 'Master JavaScript ES6+ & TypeScript', completed: true },
        { id: 'm2', title: 'Build Express REST API Architecture', completed: true },
        { id: 'm3', title: 'React Native & Mobile State Management', completed: true },
        { id: 'm4', title: 'Full Stack Deployment & Testing', completed: false }
      ]
    });

    await GoalDb.insertOne({
      userId: alex._id || alex.id,
      title: 'Achieve Peak Athletic Condition',
      description: '15% body fat, 7.5 hours avg sleep, 3L daily hydration.',
      powerId: 'body',
      target: '90 Days',
      progress: 75,
      milestones: [
        { id: 'b1', title: 'Complete 30 consecutive workout days', completed: true },
        { id: 'b2', title: 'Maintain 7.5h sleep average', completed: true },
        { id: 'b3', title: 'Zero missed hydration days', completed: false }
      ]
    });

    // Generate historical logs for 17 days
    for (let day = 1; day <= 17; day++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + (day - 1));
      const dStr = d.toISOString().split('T')[0];

      const isWeekend = d.getDay() === 0 || d.getDay() === 6;
      const score = isWeekend ? 78 : (85 + Math.floor(Math.random() * 12));

      const habitResults = insertedHabits.map(h => {
        let status = 'TARGET_ACHIEVED';
        if (day === 5 && h.name.includes('Workout')) status = 'MINIMUM_ACHIEVED';
        if (day === 12 && h.name.includes('Reading')) status = 'MINIMUM_ACHIEVED';
        if (day === 14 && h.name.includes('Portfolio')) status = 'MISSED';

        return {
          habitId: h._id || h.id,
          habitName: h.name,
          powerId: h.powerId,
          importance: h.importance,
          minimumCompleted: true,
          targetCompleted: status === 'TARGET_ACHIEVED' || status === 'STRETCH_ACHIEVED',
          stretchCompleted: status === 'STRETCH_ACHIEVED',
          actualValue: status === 'STRETCH_ACHIEVED' ? 4 : 2,
          status
        };
      });

      await DailyLogDb.insertOne({
        userId: alex._id || alex.id,
        date: dStr,
        dayNumber: day,
        habitResults,
        sleep: { durationHours: 7.5 + (day % 3 === 0 ? 0.3 : -0.2), bedtime: '23:00', wakeTime: '06:30', quality: 'Great' },
        energy: (day % 5 === 0 ? 2 : 4),
        score,
        notes: `Day ${day} complete. Strong execution on deep work blocks.`,
        distractions: [{ category: 'Social Media', durationMinutes: 25 }],
        completed: true
      });
    }

    console.log('Seed complete for Alex Vance!');
    return alex;
  } catch (err) {
    console.error('Error during seed:', err);
  }
};
