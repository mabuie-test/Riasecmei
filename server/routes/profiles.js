// server/routes/profiles.js
const express = require('express');
const auth = require('../middleware/auth');
const Profile = require('../models/Profile');
const User = require('../models/User');

const router = express.Router();

// submit or update profile
router.post('/submit', auth, async (req, res) => {
  const { sums, counts, rawAnswers } = req.body;
  if (!sums || !counts) return res.status(400).json({ message: 'Invalid payload' });
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
    console.error('profiles/submit error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// get own profile
router.get('/me', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.user._id });
    res.json({ profile });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// admin: list all profiles
router.get('/all', auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) return res.status(403).json({ message: 'Forbidden' });
    const profiles = await Profile.find().populate('userId', 'name email');
    res.json({ profiles });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// admin: compare two user profiles by user ids
router.get('/compare', auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) return res.status(403).json({ message: 'Forbidden' });
    const { a, b } = req.query; // userId a and b
    if (!a || !b) return res.status(400).json({ message: 'Missing ids' });
    const pa = await Profile.findOne({ userId: a }).populate('userId', 'name email');
    const pb = await Profile.findOne({ userId: b }).populate('userId', 'name email');
    res.json({ a: pa, b: pb });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * POST /api/profiles/compare-multi
 * Body: { ids: ["userid1","userid2", ...] }
 * Returns: profiles[], avg, pairwise distances, distancesToAvg
 * Admin-only
 */
router.post('/compare-multi', auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) return res.status(403).json({ message: 'Forbidden' });
    const ids = Array.isArray(req.body.ids) ? req.body.ids.slice(0, 20) : [];
    if (ids.length === 0) return res.status(400).json({ message: 'Missing ids array' });

    const profiles = await Profile.find({ userId: { $in: ids } }).populate('userId', 'name email');

    // Map to simple objects
    const simple = profiles.map(p => ({
      _id: p._id,
      userId: p.userId._id,
      name: p.userId.name,
      email: p.userId.email,
      scores: p.scores
    }));

    if (simple.length === 0) return res.status(400).json({ message: 'No profiles found for the provided ids' });

    const keys = ['R','I','A','S','E','C'];
    const avg = {};
    keys.forEach(k => { avg[k] = 0; });
    simple.forEach(p => { keys.forEach(k => { avg[k] += Number(p.scores[k] || 0); }); });
    keys.forEach(k => { avg[k] = Number((avg[k] / simple.length).toFixed(2)); });

    // Euclidean distance helper
    function euclid(a,b){
      return Math.sqrt(keys.reduce((acc,k) => acc + Math.pow((a[k]||0) - (b[k]||0), 2), 0));
    }

    const pairwise = [];
    for (let i=0;i<simple.length;i++){
      for (let j=i+1;j<simple.length;j++){
        pairwise.push({
          a: simple[i].userId,
          b: simple[j].userId,
          dist: Number(euclid(simple[i].scores, simple[j].scores).toFixed(3))
        });
      }
    }

    const distancesToAvg = simple.map(p => ({ id: p.userId, name: p.name, distToAvg: Number(euclid(p.scores, avg).toFixed(3)) }));

    res.json({ profiles: simple, avg, pairwise, distancesToAvg });
  } catch (err) {
    console.error('compare-multi error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
