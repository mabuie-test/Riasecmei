// creates admin user from env ADMIN_EMAIL and ADMIN_PASSWORD
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const User = require('./models/User');

dotenv.config();
(async () => {
  if (!process.env.MONGO_URI) return console.error('.env MONGO_URI missing');
  await mongoose.connect(process.env.MONGO_URI);
  const email = process.env.ADMIN_EMAIL;
  const pass = process.env.ADMIN_PASSWORD;
  if (!email || !pass) return console.error('ADMIN_EMAIL or ADMIN_PASSWORD missing');
  const exists = await User.findOne({ email });
  if (exists) return console.log('Admin exists');
  const hash = await bcrypt.hash(pass, 10);
  const admin = new User({ name: 'Admin', email, passwordHash: hash, isAdmin: true });
  await admin.save();
  console.log('Admin created');
  process.exit(0);
})();
