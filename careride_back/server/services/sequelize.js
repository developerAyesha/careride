const Sequelize = require('sequelize');
const { DB_NAME, DB_USERNAME, DB_PASSWORD, DB_HOST, DB_PORT, DB_SSL } = require('../config');

let isLogging = true;

if (process.env.NODE_ENV === 'test') {
  isLogging = false;
}

const sequelize = new Sequelize(DB_NAME, DB_USERNAME, DB_PASSWORD, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: 'postgres',
  dialectOptions: {
    ssl: DB_SSL
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  operatorsAliases: false,
  logging: isLogging
});

module.exports = sequelize;
