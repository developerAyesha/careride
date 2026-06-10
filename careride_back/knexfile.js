// Update with your config settings.
const Config = require(__dirname + "/server/config.js");
const mysql = require('mysql2');


module.exports = {

  development: {
    client: 'mysql2',
    connection: {
      host : Config.DB_HOST,
      user : Config.DB_USER,
      password : Config.DB_PASSWORD,
      database : Config.DB_DATABASE
    }
  },

  production: {
    client: 'mysql2',
    connection: {
      host : process.env.DB_HOST,
      user : process.env.DB_USER,
      password : process.env.DB_PASSWORD,
      database : process.env.DB_DATABASE
    },
    pool: {
      min: 2,
      max: 10
    }
  }

};
