// src/controllers/auth.controller.js

const bcrypt = require('bcrypt');
const jwt    = require('jsonwebtoken');
const prisma = require('../lib/prisma');

// POST /auth/login
async function loginUser(req, res) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const user = await prisma.user.findUnique({ where: { username } });

    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, depotId: user.depotId },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id:       user.id,
        username: user.username,
        fullName: user.fullName,
        role:     user.role,
        depotId:  user.depotId,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
}

// GET /auth/me  — returns current user info
async function getMe(req, res) {
  try {
    const user = await prisma.user.findUnique({
      where:  { id: req.user.id },
      select: {
        id:       true,
        username: true,
        fullName: true,
        role:     true,
        depotId:  true,
        phone:    true,
        depot:    { select: { name: true, code: true } },
      },
    });

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
}

module.exports = { loginUser, getMe };
