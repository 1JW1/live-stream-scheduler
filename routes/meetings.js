const express = require('express');
const router = express.Router();
const { Meeting } = require('../models');
const { isAuthenticated } = require('../middleware/auth');

// GET /schedule
router.get('/schedule', isAuthenticated, async (req, res) => {
  const meetings = await Meeting.findAll({ order: [['date', 'ASC']] });
  res.render('schedule', { title: 'Meeting Schedule — Hackney Council', meetings });
});

module.exports = router;
