const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

const generateToken = (user) =>
  jwt.sign(
    { id: user._id, name: user.name, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

const formatUser = (user, token) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  xp: user.xp,
  level: user.level,
  badges: user.badges,
  streak: user.streak,
  totalCompleted: user.totalCompleted,
  token,
})

// XP needed per level
const xpForLevel = (level) => level * 100

// Calculate level from XP
const calculateLevel = (xp) => {
  let level = 1
  let totalXp = xp
  while (totalXp >= xpForLevel(level)) {
    totalXp -= xpForLevel(level)
    level++
  }
  return level
}

// Check and award badges
const checkBadges = (user) => {
  const badges = [...user.badges]

  if (!badges.includes('first_task') && user.totalCompleted >= 1) {
    badges.push('first_task')
  }
  if (!badges.includes('getting_started') && user.totalCompleted >= 5) {
    badges.push('getting_started')
  }
  if (!badges.includes('task_master') && user.totalCompleted >= 10) {
    badges.push('task_master')
  }
  if (!badges.includes('legend') && user.totalCompleted >= 25) {
    badges.push('legend')
  }
  if (!badges.includes('on_fire') && user.streak >= 3) {
    badges.push('on_fire')
  }
  if (!badges.includes('unstoppable') && user.streak >= 7) {
    badges.push('unstoppable')
  }

  return badges
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: 'All fields are required' });

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ message: 'Email already in use' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed });

    res.status(201).json(formatUser(user, generateToken(user)));
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: 'All fields are required' });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: 'Invalid credentials' });

    res.json(formatUser(user, generateToken(user)));
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/auth/stats — get current user stats
router.get('/stats', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password')
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json(formatUser(user, null))
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
})

// POST /api/auth/award-xp — called when task is completed
router.post('/award-xp', protect, async (req, res) => {
  try {
    const { xpAmount, taskDueDate, taskCompletedEarly } = req.body
    const user = await User.findById(req.user.id)
    if (!user) return res.status(404).json({ message: 'User not found' })

    // Base XP
    let earned = xpAmount || 10

    // Bonus XP for completing before due date
    if (taskCompletedEarly) earned += 5

    // Update XP and level
    user.xp += earned
    user.level = calculateLevel(user.xp)
    user.totalCompleted += 1

    // Update streak
    const today = new Date().toDateString()
    const lastDate = user.lastCompletedDate
      ? new Date(user.lastCompletedDate).toDateString()
      : null

    if (lastDate === today) {
      // Already completed today, no streak change
    } else if (
      lastDate ===
      new Date(Date.now() - 86400000).toDateString()
    ) {
      // Completed yesterday — extend streak
      user.streak += 1
    } else {
      // Streak broken
      user.streak = 1
    }

    user.lastCompletedDate = new Date()

    // Check badges
    user.badges = checkBadges(user)

    await user.save()

    res.json({
      xp: user.xp,
      level: user.level,
      badges: user.badges,
      streak: user.streak,
      totalCompleted: user.totalCompleted,
      earnedXp: earned,
      newBadges: user.badges.filter(b => !req.body.currentBadges?.includes(b))
    })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
})

module.exports = router;