const express = require('express');
const router = express.Router();
const { Comment, ArchivedMeeting } = require('../models');
const { isAuthenticated } = require('../middleware/auth');

// GET /live_stream
router.get('/live_stream', isAuthenticated, async (req, res) => {
  const comments = await Comment.findAll({ order: [['timestamp', 'ASC']] });
  const videoStreamUrl = process.env.VIDEO_STREAM_URL ||
    'https://devstreaming-cdn.apple.com/videos/streaming/examples/bipbop_4x3/bipbop_4x3_variant.m3u8';
  res.render('live_stream', {
    title: 'Live Stream — Live Scheduler',
    comments,
    videoStreamUrl
  });
});

// GET /archive
router.get('/archive', isAuthenticated, async (req, res) => {
  const archivedMeetings = await ArchivedMeeting.findAll({ order: [['date', 'DESC']] });
  res.render('archive', {
    title: 'Archived Meetings — Live Scheduler',
    archivedMeetings
  });
});

module.exports = router;
