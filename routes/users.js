const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const bcrypt = require('bcrypt');

// Configurazione del database
const dbConfig = {
    host: '31.22.4.229',
    user: 'placesmy_root',
    password: '123Loris.',
    database: 'placesmy_locations'
  };

// Creazione del pool di connessioni al database
const pool = mysql.createPool(dbConfig);

// Esegui la query utilizzando il pool di connessioni
pool.query('SELECT 1 + 1', (err, rows) => {
  if (err) {
    console.error('Query error:', err);
    return;
  }
  console.log('Query executed successfully:', rows);
});

// Get user
router.get('/user', (req, res) => {
  const { uid } = req.query;
  const query = 'SELECT * FROM users WHERE id = ?';
  pool.query(query, [uid], (err, results) => {
    if (err) {
      console.error('Query error:', err);
      res.status(500).json({ error: 'Server error' });
      return;
    }
    return res.status(200).json(results);
  });
});

// Login

router.post('/login', (req, res) => {
  const { email, password } = req.query;
  // Esegui la query per ottenere i dati dell'utente corrispondenti all'email fornita
  const query = 'SELECT * FROM users WHERE email = ?';
  pool.query(query, [email], async (err, results) => {
    if (err) {
      console.error('Query error:', err);
      return res.status(500).json({ error: 'Server error' });
    }

    if (results.length === 0) {
      // Nessun utente trovato con l'email fornita
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = results[0];
    const hashedPassword = user.password;

    // Verifica la password fornita con quella crittografata nel database utilizzando bcrypt.compare
    try {
      const match = await bcrypt.compare(password, hashedPassword);
      if (match) {
        // Password corretta, l'utente può effettuare l'accesso
        return res.status(200).json(user);
      } else {
        // Password non corretta
        return res.status(401).json({ error: 'Invalid email or password' });
      }
    } catch (error) {
      console.error('Error comparing passwords:', error);
      return res.status(500).json({ error: 'Server error' });
    }
  });
});

const saltRounds = 10;
router.post('/createUser', async (req, res) => {
  const { email, password } = req.body;

  // Validazione dei dati
  if (!email || !password) {
    return res.status(400).json({ error: 'Please provide email and password' });
  }

  try {
    // Verifica se l'email è già presente nel database
    const checkQuery = 'SELECT * FROM users WHERE email = ?';
    pool.query(checkQuery, [email], (checkError, checkResults) => {
      if (checkError) {
        console.error(checkError);
        return res.status(500).json({ error: 'An error occurred. Please try again later.' });
      }

      if (checkResults.length > 0) {
        // L'email è già presente nel database
        return res.status(409).json({ error: 'Email already exists' });
      }

      // L'email non è presente nel database, procedi con la creazione dell'utente
      bcrypt.hash(password, saltRounds, (hashError, hashedPassword) => {
        if (hashError) {
          console.error(hashError);
          return res.status(500).json({ error: 'An error occurred. Please try again later.' });
        }

        // Salvataggio dei dati nel database
        const insertQuery = 'INSERT INTO users (email, password) VALUES (?, ?)';
        pool.query(insertQuery, [email, hashedPassword], (insertError, insertResults) => {
          if (insertError) {
            console.error(insertError);
            return res.status(500).json({ error: 'An error occurred. Please try again later.' });
          }

          const userId = insertResults.insertId;
          return res.status(200).json({ uid: userId });
        });
      });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'An error occurred. Please try again later.' });
  }
});

router.post('/addInformationsUser', async (req, res) => {
  const { firstName, lastName, birthDate, selectedGender, uid } = req.body;

  try {
    // L'email non è presente nel database, procedi con la creazione dell'utente
    const updateQuery = 'UPDATE users SET first_name = ?, last_name = ?, birthday = ?, gender = ? WHERE id = ?';
      pool.query(updateQuery, [firstName, lastName, birthDate, selectedGender, uid], (updateError, updateResults) => {
        if (updateError) {
          console.error(updateError);
          return res.status(500).json({ error: 'An error occurred. Please try again later.' });
        }

        return res.status(200).json({ uid: uid });
      });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'An error occurred. Please try again later.' });
  }
});

router.post('/addResponsessUser', async (req, res) => {
  const { selectedGenres, selectedAmbient, selectedTypeVenues, perfectNight, uid } = req.body;

  const selectedGenresJSON = JSON.stringify(selectedGenres);
  const selectedAmbientJSON = JSON.stringify(selectedAmbient);
  const selectedTypeVenuesJSON = JSON.stringify(selectedTypeVenues);

  try {
    // L'email non è presente nel database, procedi con la creazione dell'utente
    const updateQuery = 'UPDATE users SET selectedGenres = ?, selectedAmbient = ?, selectedTypeVenues = ?, perfectNight = ? WHERE id = ?';
      pool.query(updateQuery, [selectedGenresJSON, selectedAmbientJSON, selectedTypeVenuesJSON, perfectNight, uid], (updateError, updateResults) => {
        if (updateError) {
          console.error(updateError);
          return res.status(500).json({ error: 'An error occurred. Please try again later.' });
        } 

        return res.status(200).json({ uid: uid });
      }); 
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'An error occurred. Please try again later.' });
  }
});

router.post('/updateUser', async (req, res) => {
  const { firstName, lastName, formattedBirthDate, selectedGender, uid } = req.body;

  try {
    // L'email non è presente nel database, procedi con la creazione dell'utente
    const updateQuery = 'UPDATE users SET first_name = ?, last_name = ?, birthday = ?, gender = ? WHERE id = ?';
      pool.query(updateQuery, [firstName, lastName, formattedBirthDate, selectedGender, uid], (updateError, updateResults) => {
        if (updateError) {
          console.error(updateError);
          return res.status(500).json({ error: 'An error occurred. Please try again later.' });
        } 

        return res.status(200).json({ uid: uid });
      }); 
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'An error occurred. Please try again later.' });
  }
});

router.get('/getEmail', async (req, res) => {
  const uid = req.query.uid;

  try {
    // L'email non è presente nel database, procedi con la creazione dell'utente
    const query = `
    SELECT email
    FROM users
    WHERE uid = ?
  `; 
      pool.query(query, [uid], (updateError, updateResults) => {
        if (updateError) {
          console.error(updateError);
          return res.status(500).json({ error: 'An error occurred. Please try again later.' });
        } 

        res.json(results);
      }); 
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'An error occurred. Please try again later.' });
  }
});

module.exports = router;