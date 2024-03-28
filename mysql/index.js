const mysql = require('mysql');
const { Sequelize } = require('sequelize');

// Configurazione del database
const dbConfig = {
  connectionLimit: 1000,
  host: '31.22.4.229',
  user: 'placesmy_root',
  password: '123Loris.',
  database: 'placesmy_locations',
};

const sequelize = new Sequelize(
  'placesmy_locations', 'placesmy_root','123Loris.',
  {
  host: '31.22.4.229',
  dialect: 'mysql',
});

// Creazione del pool di connessioni al database
const pool = mysql.createPool(dbConfig);
module.exports = { sequelize, pool };
