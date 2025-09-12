const express = require('express');
const auth = require('../middleware/auth');
const Profile = require('../models/Profile');
const User = require('../models/User');

const router = express.Router();

// submit or update profile
router.post('/submit', auth, async (req, res) => {
  // req.body should contain rawAnswers: {questionId: value}, and mapping meta
  // For simplicity we expect the client sends computed raw sums per RIASEC and counts
  const { sums, counts, rawAnswers } = req.body; // sums: {R:12,...}, counts: {R:6,...}
  if (!sums || !counts) return res.status(400).json({ message: 'Invalid payload' });
  // convert sums/counts to normalized 0-6
  const normalized = {};
  ['R','I','A','S','E','C'].forEach(k => {
    const max = (counts[k] || 0) * 3; // each item max 3
    normalized[k] = max ? Math.round((sums[k] / max) * 6) : 0;
  });
  try {
    let profile = await Profile.findOne({ userId: req.user._id });
    if (!profile) profile = new Profile({ userId: req.user._id });
    profile.scores = normalized;
    profile.rawAnswers = rawAnswers || {};
    await profile.save();
    res.json({ profile });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// get own profile
router.get('/me', auth, async (req, res) => {
  const profile = await Profile.findOne({ userId: req.user._id });
  res.json({ profile });
});

// admin: list all profiles
router.get('/all', auth, async (req, res) => {
  if (!req.user.isAdmin) return res.status(403).json({ message: 'Forbidden' });
  const profiles = await Profile.find().populate('userId', 'name email');
  res.json({ profiles });
});

// admin: compare two user profiles by user ids
router.get('/compare', auth, async (req, res) => {
  if (!req.user.isAdmin) return res.status(403).json({ message: 'Forbidden' });
  const { a, b } = req.query; // userId a and b
  if (!a || !b) return res.status(400).json({ message: 'Missing ids' });
  const pa = await Profile.findOne({ userId: a }).populate('userId', 'name email');
  const pb = await Profile.findOne({ userId: b }).populate('userId', 'name email');
  res.json({ a: pa, b: pb });
});

module.exports = router;
