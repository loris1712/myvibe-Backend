const express = require('express');
const mysql = require('mysql');

// Configurazione del database
const dbConfig = {
  host: '31.22.4.229',
  user: 'placesmy_root',
  password: '123Loris.',
  database: 'placesmy_locations'
};

// Creazione della connessione al database
const connection = mysql.createConnection(dbConfig);

// Connessione al database
connection.connect((err) => {
  if (err) {
    console.error('Errore di connessione al database:', err);
    return;
  }
  console.log('Connessione al database avvenuta con successo!');
});

// Creazione dell'app Express
const app = express();

// Route per ottenere i dati dalla tabella specifica
app.get('/dati', (req, res) => {
  connection.query('SELECT * FROM Guam', (err, results) => {
    if (err) {
      console.error('Errore nella query:', err);
      res.status(500).json({ error: 'Errore del server' });
      return;
    }
    res.json(results);
  });
});

// Avvio del server
const port = 3000;
app.listen(port, () => {
  console.log(`Server in ascolto sulla porta ${port}`);
});
