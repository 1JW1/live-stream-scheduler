const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const { body, validationResult } = require('express-validator');
const { Meeting } = require('../models');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'static', 'uploads'));
  },
  filename: (req, file, cb) => {
    // Sanitise filename: keep only safe characters
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, safe);
  }
});
const upload = multer({ storage });

// GET /admin
router.get('/admin', isAuthenticated, isAdmin, async (req, res) => {
  const meetings = await Meeting.findAll({ order: [['date', 'ASC']] });
  res.render('admin', { title: 'Admin Panel — Hackney Council', meetings, errors: [] });
});

// POST /admin
router.post('/admin', isAuthenticated, isAdmin, upload.single('documents'), [
  body('date').notEmpty().withMessage('Date is required'),
  body('agenda').notEmpty().withMessage('Agenda is required').isLength({ max: 255 }).withMessage('Agenda too long')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const meetings = await Meeting.findAll({ order: [['date', 'ASC']] });
    return res.render('admin', {
      title: 'Admin Panel — Hackney Council',
      meetings,
      errors: errors.array()
    });
  }

  await Meeting.create({
    date: req.body.date,
    agenda: req.body.agenda,
    documents: req.file ? req.file.filename : null
  });
  req.flash('success', 'Meeting added successfully!');
  res.redirect('/admin');
});

// POST /admin/delete/:meeting_id
router.post('/admin/delete/:meeting_id', isAuthenticated, isAdmin, async (req, res) => {
  const meeting = await Meeting.findByPk(req.params.meeting_id);
  if (meeting) {
    await meeting.destroy();
    req.flash('success', 'Meeting deleted successfully.');
  }
  res.redirect('/admin');
});

module.exports = router;
