const mysql = require('mysql');

// Configurazione del database
const dbConfig = {
  connectionLimit: 1000,
  host: '31.22.4.229',
  user: 'placesmy_root',
  password: '123Loris.',
  database: 'placesmy_locations',
};

// Creazione del pool di connessioni al database
const pool = mysql.createPool(dbConfig);

module.exports = pool;
