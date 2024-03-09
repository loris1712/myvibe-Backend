const { Sequelize, Model, DataTypes } = require('sequelize');
const { sequelize } = require('../index');

const UserPlan = sequelize.define('user_plan', {
  user_id: {
    type: DataTypes.BIGINT,
  },
  privacy: {
    type: DataTypes.ENUM('public', 'private')
  },
  plan_date: {
    type: DataTypes.STRING,
  },
  music: {
    type: DataTypes.STRING,
  },
  dresscode: {
    type: DataTypes.STRING,
  },
  description: {
    type: DataTypes.TEXT,
  },
  capacity: {
    type: DataTypes.INTEGER,
  },
  links: {
    type: DataTypes.TEXT,
    set(value) {
      this.setDataValue('links', JSON.stringify(value));
    },
    get() {
      const rawValue = this.getDataValue('links');
      return rawValue ? JSON.parse(rawValue) : null;
    },
  },
  stops: {
    type: DataTypes.TEXT,
    set(value) {
      this.setDataValue('stops', JSON.stringify(value));
    },
    get() {
      const rawValue = this.getDataValue('stops');
      return rawValue ? JSON.parse(rawValue) : [];
    },
  },
}, {
    tableName:'user_plan'
});

module.exports = UserPlan;
