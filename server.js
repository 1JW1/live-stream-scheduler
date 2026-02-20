require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const session = require('express-session');
const flash = require('express-flash');
const expressLayouts = require('express-ejs-layouts');
const csurf = require('csurf');
const path = require('path');
const fs = require('fs');
const SQLiteStore = require('connect-sqlite3')(session);

// Ensure required directories exist on fresh clones
fs.mkdirSync(path.join(__dirname, 'static', 'uploads'), { recursive: true });
const { sequelize, Comment } = require('./models');

const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const meetingsRoutes = require('./routes/meetings');
const streamRoutes = require('./routes/stream');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layout');

// Static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'static', 'uploads')));
app.use('/static', express.static(path.join(__dirname, 'static')));

// Body parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session
app.use(session({
  store: new SQLiteStore({ db: 'sessions.db', dir: './instance' }),
  secret: process.env.SECRET_KEY || 'dev-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 }
}));

app.use(flash());

// CSRF protection
const csrfProtection = csurf();
app.use(csrfProtection);

// Make user and flash available in all views
app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  res.locals.csrfToken = req.csrfToken();
  res.locals.messages = req.flash();
  next();
});

// Routes
app.use('/', authRoutes);
app.use('/', meetingsRoutes);
app.use('/', adminRoutes);
app.use('/', streamRoutes);

// Socket.IO real-time chat
io.on('connection', (socket) => {
  socket.on('join', (data) => {
    socket.join(data.room);
    io.to(data.room).emit('status', { msg: `${data.username} has joined the room.` });
  });

  socket.on('leave', (data) => {
    socket.leave(data.room);
    io.to(data.room).emit('status', { msg: `${data.username} has left the room.` });
  });

  socket.on('new_comment', async (data) => {
    if (!data.username || !data.comment) return;
    try {
      const comment = await Comment.create({
        username: data.username,
        comment: data.comment
      });
      io.emit('broadcast_comment', {
        username: comment.username,
        comment: comment.comment
      });
    } catch (err) {
      console.error('Error saving comment:', err);
    }
  });
});

// Database sync and server start
const PORT = process.env.PORT || 8000;

sequelize.sync().then(() => {
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}).catch(err => {
  console.error('Failed to sync database:', err);
  process.exit(1);
});

module.exports = { app, server };
