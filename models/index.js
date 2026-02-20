const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs');

const instanceDir = path.join(__dirname, '..', 'instance');
if (!fs.existsSync(instanceDir)) {
  fs.mkdirSync(instanceDir, { recursive: true });
}

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '..', 'instance', 'app.db'),
  logging: false
});

const User = require('./User')(sequelize);
const Meeting = require('./Meeting')(sequelize);
const Comment = require('./Comment')(sequelize);
const ArchivedMeeting = require('./ArchivedMeeting')(sequelize);

module.exports = { sequelize, User, Meeting, Comment, ArchivedMeeting };
