const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Admin } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password are required.' });
    }

    // Check hardcoded admin first
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    if (username === adminUsername && password === adminPassword) {
      const token = jwt.sign(
        { id: 'hardcoded-admin', username, role: 'admin' },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
      return res.json({ 
        success: true, 
        token, 
        admin: { username, role: 'admin' },
        message: 'Login successful'
      });
    }

    // Check DB admin
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const token = jwt.sign(
      { id: admin._id, username: admin.username, role: admin.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ 
      success: true, 
      token, 
      admin: { username: admin.username, role: admin.role },
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login.' });
  }
});

// POST /api/auth/verify
router.get('/verify', require('../middleware/auth'), (req, res) => {
  res.json({ success: true, admin: req.admin });
});

module.exports = router;
