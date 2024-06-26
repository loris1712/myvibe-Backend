const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const bcrypt = require('bcryptjs');



// Creazione del pool di connessioni al database
const pool = require('../mysql').pool;


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
    //console.log(results);
    return res.status(200).json(results);
  });
});

// Login

router.post('/login', (req, res) => {
  const { email, password } = req.query;
  
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

router.post('/login2', (req, res) => {
  const { fullname } = req.query;
  
  const query = 'SELECT * FROM users WHERE fullname = ?';
  pool.query(query, [fullname], async (err, results) => {
    if (err) {
      console.error('Query error:', err);
      return res.status(500).json({ error: 'Server error' });
    }

    if (results.length === 0) {
      // Nessun utente trovato con l'email fornita
      return res.status(401).json({ error: 'Invalid fullname' });
    }

    const user = results[0];
    return res.status(200).json(user);
  });
});

router.delete('/deleteUser/:id', async (req, res) => {
  const userId = req.params.id;

  try {
    // Verifica se l'utente esiste nel database
    const checkQuery = 'SELECT * FROM users WHERE id = ?';
    pool.query(checkQuery, [userId], (checkError, checkResults) => {
      if (checkError) {
        console.error(checkError);
        return res.status(500).json({ error: 'An error occurred. Please try again later.' });
      }

      if (checkResults.length === 0) {
        // L'utente non è presente nel database
        return res.status(404).json({ error: 'User not found' });
      }

      // Elimina l'utente dal database
      const deleteQuery = 'DELETE FROM users WHERE id = ?';
      pool.query(deleteQuery, [userId], (deleteError, deleteResults) => {
        if (deleteError) {
          console.error(deleteError);
          return res.status(500).json({ error: 'An error occurred. Please try again later.' });
        }

        return res.status(200).json({ message: 'User deleted successfully' });
      });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'An error occurred. Please try again later.' });
  }
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

router.post('/createUser2', async (req, res) => {
  const { fullname } = req.body;

  // Validazione dei dati
  if (!fullname) {
    return res.status(400).json({ error: 'Please provide fullname' });
  }

  try {
    // Verifica se l'email è già presente nel database
    const checkQuery = 'SELECT * FROM users WHERE fullname = ?';
    pool.query(checkQuery, [fullname], (checkError, checkResults) => {
      if (checkError) {
        console.error(checkError);
        return res.status(500).json({ error: 'An error occurred. Please try again later.' });
      }

      if (checkResults.length > 0) {
        // L'email è già presente nel database
        return res.status(409).json({ error: 'Fullname already exists' });
      }

      // L'email non è presente nel database, procedi con la creazione dell'utente
      const insertQuery = 'INSERT INTO users (fullname) VALUES (?)';
        pool.query(insertQuery, [fullname], (insertError, insertResults) => {
          if (insertError) {
            console.error(insertError);
            return res.status(500).json({ error: 'An error occurred. Please try again later.' });
          }

          const userId = insertResults.insertId;
          return res.status(200).json({ uid: userId });
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

  if(highestScore < 1){
    highestScore = 1
  };
 
  try {
    const updateQuery = 'UPDATE users SET question1 = ?, question2 = ?, question3 = ?, question4 = ?, question5 = ?, Persona = ? WHERE id = ?';
      pool.query(updateQuery, [question1JSON, question2JSON, question3JSON, question4JSON, question5JSON, highestScore, uid], (updateError, updateResults) => {
        if (updateError) {
          console.error(updateError);
          return res.status(500).json({ error: 'An error occurred. Please try again later.' });
        }

        const selectQuery = 'SELECT * FROM users WHERE id = ?';
        pool.query(selectQuery, [uid], (selectError, selectResults) => {
          if (selectError) {
            console.error(selectError);
            return res.status(500).json({ error: 'An error occurred. Please try again later.' });
          }

          if (selectResults.length > 0) {
            const { uid, email } = selectResults[0];
            
            return res.status(200).json({ uid: uid, email: email });
          }

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

router.get('/getUserDetails/:user_id', async (req, res) => {
  const { user_id } = req.params;

  try {
    const query = `
      SELECT *
      FROM user_info
      WHERE user_id = ?
    `; 
    pool.query(query, [user_id], (error, results) => {
      if (error) {
        console.error(error);
        return res.status(500).json({ error: 'An error occurred. Please try again later.' });
      } 

      const userData = results[0];
      res.json({ data: userData }); 
    }); 
  } catch (error) { 
    console.error(error);
    return res.status(500).json({ error: 'An error occurred. Please try again later.' });
  } 
}); 

router.post('/saveUserInfo', async (req, res) => {
  const payload = req.body;

  try {
    const checkQuery = `
      SELECT user_id
      FROM user_info
      WHERE user_id = ?
    `;

    pool.query(checkQuery, [payload.userId], (checkError, results) => {
      if (checkError) {
        console.error(checkError);
        return res.status(500).json({ error: 'An error occurred. Please try again later.' });
      }

      if (results.length === 0) {
        const insertQuery = `
          INSERT INTO user_info (user_id, bio, instagram_link, phone_number)
          VALUES (?, ?, ?, ?)
        `;
        const insertValues = [payload.userId, payload.bio, payload.instagram_link, payload.phone_number];

        pool.query(insertQuery, insertValues, (insertError, insertResults) => {
          if (insertError) {
            console.error(insertError);
            return res.status(500).json({ error: 'An error occurred while creating user info.' });
          }
          return res.status(200).json({ message: 'User info created successfully.' });
        });
      } else {
        const updateQuery = `
          UPDATE user_info
          SET bio = ?, instagram_link = ?, phone_number = ?
          WHERE user_id = ?
        `;
        
        const updateValues = [payload.bio, payload.instagram_link, payload.phone_number, payload.userId];

        pool.query(updateQuery, updateValues, (updateError, updateResults) => {
          if (updateError) {
            console.error(updateError);
            return res.status(500).json({ error: 'An error occurred while updating user info.' });
          }

          // Check if payload.name is not empty
          if (payload.name && payload.name.trim().length > 0) {
            const updateUserQuery = `
              UPDATE users
              SET fullname = ?
              WHERE id = ?
            `;
            const updateUserNameValues = [payload.name, payload.userId];

            pool.query(updateUserQuery, updateUserNameValues, (updateUserError, updateUserResults) => {
              if (updateUserError) {
                console.error(updateUserError);
                return res.status(500).json({ error: 'An error occurred while updating user fullname.' });
              }
              return res.status(200).json({ message: 'User info and fullname updated successfully.' });
            });
          } else {
            return res.status(200).json({ message: 'User info updated successfully.' });
          }
        });
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'An error occurred. Please try again later.' });
  }
});

module.exports = router;