const request = require('supertest');

// Use in-memory SQLite for tests
process.env.NODE_ENV = 'test';

// Override Sequelize storage before requiring models
jest.mock('../models/index.js', () => {
  const { Sequelize, DataTypes } = require('sequelize');
  const sequelize = new Sequelize({ dialect: 'sqlite', storage: ':memory:', logging: false });

  const User = sequelize.define('User', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    username: { type: DataTypes.STRING(80), allowNull: false, unique: true },
    email: { type: DataTypes.STRING(120), allowNull: false, unique: true },
    password: { type: DataTypes.STRING(255), allowNull: false },
    role: { type: DataTypes.STRING(10), allowNull: false }
  }, { tableName: 'user', timestamps: false });

  const Meeting = sequelize.define('Meeting', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    date: { type: DataTypes.DATEONLY, allowNull: false },
    agenda: { type: DataTypes.STRING(255), allowNull: false },
    documents: { type: DataTypes.STRING(255), allowNull: true }
  }, { tableName: 'meeting', timestamps: false });

  const Comment = sequelize.define('Comment', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    username: { type: DataTypes.STRING(80), allowNull: false },
    comment: { type: DataTypes.TEXT, allowNull: false },
    timestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  }, { tableName: 'comment', timestamps: false });

  const ArchivedMeeting = sequelize.define('ArchivedMeeting', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    date: { type: DataTypes.DATE, allowNull: false },
    video_path: { type: DataTypes.STRING(200), allowNull: false },
    minutes_path: { type: DataTypes.STRING(200), allowNull: false }
  }, { tableName: 'archived_meeting', timestamps: false });

  return { sequelize, User, Meeting, Comment, ArchivedMeeting };
});

let app, server;

beforeAll(async () => {
  const { sequelize } = require('../models');
  await sequelize.sync({ force: true });
  const mod = require('../server');
  app = mod.app;
  server = mod.server;
});

afterAll((done) => {
  server.close(done);
});

describe('GET /', () => {
  it('should return 200 and display home page', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('Hackney Council');
  });
});

describe('GET /login', () => {
  it('should return 200 and display login page', async () => {
    const res = await request(app).get('/login');
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('Welcome back');
  });
});

describe('GET /register', () => {
  it('should return 200 and display register page', async () => {
    const res = await request(app).get('/register');
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('Create an account');
  });
});

describe('GET /schedule (unauthenticated)', () => {
  it('should redirect to login', async () => {
    const res = await request(app).get('/schedule');
    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toContain('/login');
  });
});
