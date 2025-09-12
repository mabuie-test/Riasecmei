const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: 'Missing fields' });
  try {
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already in use' });
    const hash = await bcrypt.hash(password, 10);
    const user = new User({ name, email, passwordHash: hash });
    await user.save();
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Missing fields' });
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(400).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin } });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});
// --- INÍCIO: endpoint temporário para criação de admin (REMOVER APÓS USO) ---
router.post('/create-admin-temp', async (req, res) => {
  try {
    const { name, email, password, registerToken } = req.body;
    if (!registerToken || registerToken !== process.env.ADMIN_REGISTER_TOKEN) {
      return res.status(403).json({ message: 'Token de registo inválido ou ausente' });
    }
    if (!email || !password || !name) {
      return res.status(400).json({ message: 'Campos obrigatórios: name, email, password' });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      exists.isAdmin = true;
      await exists.save();
      console.log(`[ADMIN-CREATE] Promoted existing user to admin: ${email}`);
      return res.json({ message: 'Utilizador existente promovido a admin', email });
    }

    const bcrypt = require('bcrypt');
    const hash = await bcrypt.hash(password, 10);
    const user = new User({ name, email, passwordHash: hash, isAdmin: true });
    await user.save();

    console.log(`[ADMIN-CREATE] New admin created: ${email} at ${new Date().toISOString()}`);
    return res.json({ message: 'Admin criado com sucesso', email });
  } catch (err) {
    console.error('Erro create-admin-temp:', err);
    return res.status(500).json({ message: 'Erro no servidor' });
  }
});
// --- FIM: endpoint temporário para criação de admin ---


  
module.exports = router;
