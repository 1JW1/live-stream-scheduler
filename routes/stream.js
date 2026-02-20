const express = require('express');
const router = express.Router();
const { Comment, ArchivedMeeting } = require('../models');
const { isAuthenticated } = require('../middleware/auth');

// GET /live_stream
router.get('/live_stream', isAuthenticated, async (req, res) => {
  const comments = await Comment.findAll({ order: [['timestamp', 'ASC']] });
  const videoStreamUrl = '/static/videos/live_stream.m3u8';
  res.render('live_stream', {
    title: 'Live Stream — Hackney Council',
    comments,
    videoStreamUrl
  });
});

// GET /archive
router.get('/archive', isAuthenticated, async (req, res) => {
  const archivedMeetings = await ArchivedMeeting.findAll({ order: [['date', 'DESC']] });
  res.render('archive', {
    title: 'Archived Meetings — Hackney Council',
    archivedMeetings
  });
});

module.exports = router;
