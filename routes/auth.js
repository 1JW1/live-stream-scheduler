const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const { User } = require('../models');

// GET /
router.get('/', (req, res) => {
  res.render('index', { title: 'Home — Live Scheduler' });
});

// GET /register
router.get('/register', (req, res) => {
  res.render('register', { title: 'Register — Live Scheduler', errors: [] });
});

// POST /register
router.post('/register', [
  body('username').notEmpty().withMessage('Username is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('role').isIn(['user', 'admin']).withMessage('Invalid role'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('confirm_password').custom((value, { req }) => {
    if (value !== req.body.password) throw new Error('Passwords do not match');
    return true;
  })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render('register', {
      title: 'Register — Live Scheduler',
      errors: errors.array(),
      old: req.body
    });
  }

  try {
    const hashed = await bcrypt.hash(req.body.password, 12);
    await User.create({
      username: req.body.username,
      email: req.body.email,
      password: hashed,
      role: req.body.role
    });
    req.flash('success', 'Account created successfully! Please log in.');
    res.redirect('/login');
  } catch (err) {
    const msg = err.name === 'SequelizeUniqueConstraintError'
      ? 'Username or email already taken.'
      : 'Registration failed. Please try again.';
    return res.render('register', {
      title: 'Register — Live Scheduler',
      errors: [{ msg }],
      old: req.body
    });
  }
});

// GET /login
router.get('/login', (req, res) => {
  res.render('login', { title: 'Login — Live Scheduler', errors: [] });
});

// POST /login
router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render('login', {
      title: 'Login — Live Scheduler',
      errors: errors.array(),
      old: req.body
    });
  }

  try {
    const user = await User.findOne({ where: { email: req.body.email } });
    if (user && await bcrypt.compare(req.body.password, user.password)) {
      req.session.user = { id: user.id, username: user.username, email: user.email, role: user.role };
      const next = req.query.next || '/';
      return res.redirect(next);
    }
    return res.render('login', {
      title: 'Login — Live Scheduler',
      errors: [{ msg: 'Login failed. Check your email and password.' }],
      old: req.body
    });
  } catch (err) {
    return res.render('login', {
      title: 'Login — Live Scheduler',
      errors: [{ msg: 'An error occurred. Please try again.' }],
      old: req.body
    });
  }
});

// GET /logout
router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

module.exports = router;
