const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const bcrypt = require('bcryptjs');

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

// Get personas
router.get('/personas', (req, res) => {
  const query = 'SELECT * FROM Personas';
  pool.query(query, [], (err, results) => {
    if (err) {
      console.error('Query error:', err);
      res.status(500).json({ error: 'Server error' });
      return;
    }
    console.log(results);
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

router.post('/addFeedback', async (req, res) => {
  const { feedback, uid } = req.body;

  try {
    const updateQuery = 'INSERT INTO feedbacks (user_id, feedback) VALUES (?, ?)';
      pool.query(updateQuery, [uid, feedback], (updateError, updateResults) => {
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

router.post('/addFeedbackSpot', async (req, res) => {
  const { feedback, rankPlace, overallVibe, musicSelection, serviceProvided, cleanliness, drinkFoodOptions, crowdAtmosphere, moneyValue, spot_id, uid } = req.body;

  try {
    const updateQuery = 'INSERT INTO feedbacks_spots (user_id, spot_id, feedback, rank, overallVibe, musicSelection, serviceProvided, cleanliness, drinkFoodOptions, crowdAtmosphere, moneyValue) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
      pool.query(updateQuery, [uid, spot_id, feedback, rankPlace, overallVibe, musicSelection, serviceProvided, cleanliness, drinkFoodOptions, crowdAtmosphere, moneyValue], (updateError, updateResults) => {
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
  const { question1, question2, question3, question4, question5, highestScore, uid } = req.body;

  const question1JSON = JSON.stringify(question1);
  const question2JSON = JSON.stringify(question2);
  const question3JSON = JSON.stringify(question3);
  const question4JSON = JSON.stringify(question4);
  const question5JSON = JSON.stringify(question5);

  try {
    const updateQuery = 'UPDATE users SET question1 = ?, question2 = ?, question3 = ?, question4 = ?, question5 = ?, Persona = ? WHERE id = ?';
      pool.query(updateQuery, [question1JSON, question2JSON, question3JSON, question4JSON, question5JSON, highestScore, uid], (updateError, updateResults) => {
        if (updateError) {
          console.error(updateError);
          return res.status(500).json({ error: 'An error occurred. Please try again later.' });
        }

        // Se l'aggiornamento è avvenuto con successo, esegui la query per cercare l'email
        const selectQuery = 'SELECT id, email FROM users WHERE id = ?';
        pool.query(selectQuery, [uid], (selectError, selectResults) => {
          if (selectError) {
            console.error(selectError);
            return res.status(500).json({ error: 'An error occurred. Please try again later.' });
          }

          // Se la query di ricerca ha restituito dei risultati, invia il valore di uid e email come risposta
          if (selectResults.length > 0) {
            const { uid, email } = selectResults[0];
            return res.status(200).json({ uid: uid, email: email });
          }

          // Altrimenti, invia una risposta vuota o un messaggio di errore appropriato
          return res.status(200).json({ uid: '', email: '' });
        });
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
    WHERE id = ?
  `; 
      pool.query(query, [uid], (updateError, updateResults) => {
        if (updateError) {
          console.error(updateError);
          return res.status(500).json({ error: 'An error occurred. Please try again later.' });
        } 

        res.json(updateResults);
      }); 
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'An error occurred. Please try again later.' });
  }
});

module.exports = router;