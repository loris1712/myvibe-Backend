const express = require('express');
const router = express.Router();
const mysql = require('mysql');

const natural = require('natural');
const tokenizer = new natural.WordTokenizer();

// Configurazione del database
const dbConfig = {
  connectionLimit : 1000,
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
  //console.log('Query executed successfully:', rows);
});

// Rotta per ottenere tutti i luoghi
router.get('/places', (req, res) => {
  const cityName = req.query.cityName; // Assuming the city name is passed as a query parameter
  const id = req.query.id; // Assuming the city name is passed as a query parameter
  
  const query = `
  SELECT *, ns.spot_id
  FROM placesList ns
  JOIN Cities c ON ns.city_id = c.city_id
  LEFT JOIN NightlifeSpots_Vibes nsv ON ns.spot_id = nsv.spot_id
  LEFT JOIN Vibes v ON nsv.vibe_id = v.vibe_id
  JOIN users u ON u.id = ?
  WHERE c.city_name = ?
  AND (
      (u.Persona IN (1, 4, 8, 11) AND 
       (FIND_IN_SET('1', ns.Personas) > 0 OR FIND_IN_SET('4', ns.Personas) > 0 OR FIND_IN_SET('8', ns.Personas) > 0 OR FIND_IN_SET('11', ns.Personas) > 0))
      OR
      (u.Persona IN (2, 7) AND 
       (FIND_IN_SET('2', ns.Personas) > 0 OR FIND_IN_SET('7', ns.Personas) > 0))
      OR
      (u.Persona IN (3, 12, 15) AND 
       (FIND_IN_SET('3', ns.Personas) > 0 OR FIND_IN_SET('12', ns.Personas) > 0 OR FIND_IN_SET('15', ns.Personas) > 0))
      OR
      (u.Persona IN (5, 9, 14) AND 
       (FIND_IN_SET('5', ns.Personas) > 0 OR FIND_IN_SET('9', ns.Personas) > 0 OR FIND_IN_SET('14', ns.Personas) > 0))
      OR
      (u.Persona IN (6, 10, 13) AND 
       (FIND_IN_SET('6', ns.Personas) > 0 OR FIND_IN_SET('10', ns.Personas) > 0 OR FIND_IN_SET('13', ns.Personas) > 0))
  )
    
  `; 

  pool.query(query, [id, cityName], (err, results) => {
    if (err) {
      console.error('Query error:', err);
      res.status(500).json({ error: 'Server error' });
      return;
    }
    
    //console.log(results);
    res.json(results);
    
  });
});

// Rotta per ottenere tutti i luoghi
router.get('/allPlaces', (req, res) => {
  const cityName = req.query.cityName;
  
  const query = `
    SELECT *, ns.spot_id
    FROM placesList ns
    JOIN Cities c ON ns.city_id = c.city_id
    LEFT JOIN NightlifeSpots_Vibes nsv ON ns.spot_id = nsv.spot_id
    LEFT JOIN Vibes v ON nsv.vibe_id = v.vibe_id
    WHERE c.city_name = ? 
  `; 

  pool.query(query, [cityName], (err, results) => {
    if (err) {
      console.error('Query error:', err);
      res.status(500).json({ error: 'Server error' });
      return;
    }
    res.json(results);
  });
});

// Migliori luoghi
router.get('/bestPlaces', (req, res) => {
  const cityName = req.query.cityName; // Assuming the city name is passed as a query parameter
  
  const query = `
  SELECT *, ns.spot_id
  FROM placesList ns
  JOIN Cities c ON ns.city_id = c.city_id
  LEFT JOIN NightlifeSpots_Vibes nsv ON ns.spot_id = nsv.spot_id
  LEFT JOIN Vibes v ON nsv.vibe_id = v.vibe_id
  WHERE c.city_name = ?
  GROUP BY ns.spot_id
  LIMIT 10
  `; 

  pool.query(query, [cityName], (err, results) => {
    if (err) {
      console.error('Query error:', err);
      res.status(500).json({ error: 'Server error' });
      return;
    }
    res.json(results);
  });
});

// Ricerca dei locali
router.get('/search', (req, res) => {
  const text = req.query.text.toLowerCase();
  const city = req.query.city;
  
  const query = `
  SELECT ns.spot_id, ns.*, c.city_name
  FROM placesList ns
  JOIN Cities c ON ns.city_id = c.city_id
  WHERE 
    (FIND_IN_SET(LOWER(?), LOWER(ns.name)) > 0 OR 
    FIND_IN_SET(LOWER(?), LOWER(ns.query)) > 0 OR 
    FIND_IN_SET(LOWER(?), LOWER(ns.Music)) > 0 OR 
    FIND_IN_SET(LOWER(?), LOWER(ns.Dresscode)) > 0 OR 
    FIND_IN_SET(LOWER(?), LOWER(ns.type)) > 0 OR 
    FIND_IN_SET(LOWER(?), LOWER(ns.subtypes)) > 0 OR 
    LOWER(ns.street) LIKE ? OR 
    LOWER(ns.description) LIKE ?)
  AND c.city_name = ?;
  
  `;

  pool.query(query, [text, text, text, text, text, text, `%${text}%`, `%${text}%`, city], (err, results) => {
    if (err) {
      console.error('Query error:', err);
      res.status(500).json({ error: 'Server error' });
      return;
    }

    // Se non ci sono risultati, cerca risultati simili
    if (results.length === 0) {
      // Esegui una ricerca fuzzy o una ricerca parziale qui
      // Ad esempio, usando natural.JaroWinklerDistance per trovare corrispondenze simili
      const inputTokens = tokenizer.tokenize(text);
      const similarityThreshold = 0.8; // Modifica il valore del threshold a seconda di quanto vuoi che la corrispondenza sia simile
      const similarResults = [];

      results.forEach(result => {
        const nameTokens = tokenizer.tokenize(result.name.toLowerCase());
        const queryTokens = tokenizer.tokenize(result.query.toLowerCase());

        const nameSimilarity = natural.JaroWinklerDistance(inputTokens.join(' '), nameTokens.join(' '));
        const querySimilarity = natural.JaroWinklerDistance(inputTokens.join(' '), queryTokens.join(' '));

        if (nameSimilarity >= similarityThreshold || querySimilarity >= similarityThreshold) {
          similarResults.push(result);
        }
      });

      // Restituisci risultati simili
      res.json(similarResults);
    } else {
      // Se ci sono risultati, restituisci quelli
      res.json(results);
    }
  });
});

router.get('/filteredHomePlaces', (req, res) => {
  const cityName = req.query.cityName;
  const queryParams = [cityName];
  let whereClause = "WHERE c.city_name = ?";

  if (req.query.filter) {
    whereClause += " AND (FIND_IN_SET(LOWER(?), LOWER(ns.type)) > 0)";
    queryParams.push(req.query.filter);
  }

  if (req.query.reservation_required) {
    whereClause += " OR ns.reservation_required LIKE ?";
    queryParams.push("%" + req.query.reservation_required + "%");
  }

  if (req.query.busiest_day) {
    whereClause += " OR ns.busiest_day LIKE ?";
    queryParams.push("%" + req.query.busiest_day + "%");
  }

  const query = `
    SELECT *, ns.spot_id
    FROM placesList ns
    JOIN Cities c ON ns.city_id = c.city_id
    LEFT JOIN NightlifeSpots_Vibes nsv ON ns.spot_id = nsv.spot_id
    LEFT JOIN Vibes v ON nsv.vibe_id = v.vibe_id
    ${whereClause}
    GROUP BY ns.spot_id
    ORDER BY RAND()
    LIMIT 20
  `;

  pool.query(query, queryParams, (err, results) => {
    if (err) {
      console.error('Query error:', err);
      res.status(500).json({ error: 'Server error' });
      return;
    }
    res.json(results);
  });
});

router.get('/filteredHomePlaces2', (req, res) => {
  const cityName = req.query.cityName;
  const filter = req.query.filter;
  const queryParams = [cityName, filter];

  const query = `
    SELECT *, ns.spot_id
    FROM placesList ns
    JOIN Cities c ON ns.city_id = c.city_id
    LEFT JOIN NightlifeSpots_Vibes nsv ON ns.spot_id = nsv.spot_id
    LEFT JOIN Vibes v ON nsv.vibe_id = v.vibe_id
    WHERE c.city_name = ? AND (FIND_IN_SET(LOWER(?), LOWER(ns.type)) > 0)
    GROUP BY ns.spot_id
    ORDER BY RAND()
    LIMIT 20
  `;

  pool.query(query, queryParams, (err, results) => {
    if (err) {
      console.error('Query error:', err);
      res.status(500).json({ error: 'Server error' });
      return;
    }

    // Se non ci sono risultati, esegui un'altra query per luoghi simili basati su altri criteri
    if (results.length === 0) {
      const similarQuery = `
        SELECT *, ns.spot_id
        FROM placesList ns
        JOIN Cities c ON ns.city_id = c.city_id
        WHERE c.city_name = ?
        ORDER BY RAND()
        LIMIT 20
      `;

      pool.query(similarQuery, [cityName], (similarErr, similarResults) => {
        if (similarErr) {
          console.error('Similar query error:', similarErr);
          res.status(500).json({ error: 'Server error' });
          return;
        }
        res.json(similarResults);
      });
    } else {
      res.json(results);
    }
  });
});

router.get('/filteredHomePlacesMusic', (req, res) => {
  const cityName = req.query.cityName;
  const filter = req.query.filter;
  const queryParams = [cityName, filter];

  const query = `
    SELECT *, ns.spot_id
    FROM placesList ns
    JOIN Cities c ON ns.city_id = c.city_id
    LEFT JOIN NightlifeSpots_Vibes nsv ON ns.spot_id = nsv.spot_id
    LEFT JOIN Vibes v ON nsv.vibe_id = v.vibe_id
    WHERE c.city_name = ? AND (FIND_IN_SET(LOWER(?), LOWER(ns.Music)) > 0)
    GROUP BY ns.spot_id
    ORDER BY RAND()
    LIMIT 20
  `;

  pool.query(query, queryParams, (err, results) => {
    if (err) {
      console.error('Query error:', err);
      res.status(500).json({ error: 'Server error' });
      return;
    }
    res.json(results);
  });
});

router.get('/filteredHomePlacesMusic2', (req, res) => {
  const cityName = req.query.cityName;
  const filter = req.query.filter;
  const queryParams = [cityName, filter];

  const query = `
    SELECT *, ns.spot_id
    FROM placesList ns
    JOIN Cities c ON ns.city_id = c.city_id
    LEFT JOIN NightlifeSpots_Vibes nsv ON ns.spot_id = nsv.spot_id
    LEFT JOIN Vibes v ON nsv.vibe_id = v.vibe_id
    WHERE c.city_name = ? AND (FIND_IN_SET(LOWER(?), LOWER(ns.Music)) > 0)
    GROUP BY ns.spot_id
    ORDER BY RAND()
    LIMIT 20
  `;

  pool.query(query, queryParams, (err, results) => {
    if (err) {
      console.error('Query error:', err);
      res.status(500).json({ error: 'Server error' });
      return;
    }
    res.json(results);
  });
});

router.get('/placesFiltered', (req, res) => {
  const cityName = req.query.cityName;
  const category = req.query.category;
  const prices = req.query.price;
  const music = req.query.music;
  const dresscode = req.query.dresscode;
  const food = req.query.food;
  const reservation = req.query.reservation;
  const id = req.query.id;

  let query = `
    SELECT *, ns.spot_id
    FROM placesList ns
    JOIN Cities c ON ns.city_id = c.city_id
    LEFT JOIN NightlifeSpots_Vibes nsv ON ns.spot_id = nsv.spot_id
    LEFT JOIN Vibes v ON nsv.vibe_id = v.vibe_id
    JOIN users u ON u.id = ? 
    AND (
      (u.Persona IN (1, 4, 8, 11) AND 
       (FIND_IN_SET('1', ns.Personas) > 0 OR FIND_IN_SET('4', ns.Personas) > 0 OR FIND_IN_SET('8', ns.Personas) > 0 OR FIND_IN_SET('11', ns.Personas) > 0))
      OR
      (u.Persona IN (2, 7) AND 
       (FIND_IN_SET('2', ns.Personas) > 0 OR FIND_IN_SET('7', ns.Personas) > 0))
      OR
      (u.Persona IN (3, 12, 15) AND 
       (FIND_IN_SET('3', ns.Personas) > 0 OR FIND_IN_SET('12', ns.Personas) > 0 OR FIND_IN_SET('15', ns.Personas) > 0))
      OR
      (u.Persona IN (5, 9, 14) AND 
       (FIND_IN_SET('5', ns.Personas) > 0 OR FIND_IN_SET('9', ns.Personas) > 0 OR FIND_IN_SET('14', ns.Personas) > 0))
      OR
      (u.Persona IN (6, 10, 13) AND 
       (FIND_IN_SET('6', ns.Personas) > 0 OR FIND_IN_SET('10', ns.Personas) > 0 OR FIND_IN_SET('13', ns.Personas) > 0))
  )
  `;

  const params = [id]; // Inseriamo l'ID nei parametri

  if (cityName) {
    query += ' AND c.city_name = ?';
    params.push(cityName);
  }

  if (category) {
    query += ' AND ns.category LIKE ?';
    params.push(`%${category}%`);
  }

  if (prices) {
    const priceArray = prices.split(',');
    const placeholders = priceArray.map(() => '?').join(',');
    query += ` AND ns.range_value IN (${placeholders})`;
    params.push(...priceArray);
  }

  if (music) {
    query += ' AND ns.Music LIKE ?';
    params.push(`%${music}%`);
  }

  if (dresscode) {
    query += ' AND ns.Dresscode LIKE ?';
    params.push(`%${dresscode}%`);
  }

  if (food) {
    if (food === 'yes') {
      query += ' AND ns.food = 1';
    } else if (food === 'no') {
      query += ' AND ns.food = 0';
    }
  }

  if (reservation) {
    query += ' AND ns.reservation_required = ?';
    params.push(reservation);
  }

  query += ' GROUP BY ns.spot_id';

  //console.log(params);
  //console.log(query);

  pool.query(query, params, (err, results) => {
    if (err) {
      console.error('Query error:', err);
      res.status(500).json({ error: 'Server error' });
      return;
    }
    res.json(results);
  });
});


router.get('/cities', (req, res) => {
  //const cityName = req.query.cityName; // Assuming the city name is passed as a query parameter
  
  const query = `
    SELECT city_name, city_id
    FROM Cities
  `;

  pool.query(query, (err, results) => {
    if (err) {
      console.error('Query error:', err);
      res.status(500).json({ error: 'Server error' });
      return;
    }
    res.json(results);
  });
});

router.get('/getCityPlace', (req, res) => {
  const city_id = req.query.city_id; // Assuming the city name is passed as a query parameter
  
  const query = `
    SELECT city_name, city_id
    FROM Cities
    where city_id = ?
  `;

  pool.query(query, [city_id], (err, results) => {
    if (err) {
      console.error('Query error:', err);
      res.status(500).json({ error: 'Server error' });
      return;
    }
    res.json(results);
  });
});

router.get('/randomPlace', (req, res) => {

  const query = `
  SELECT *, ns.spot_id
    FROM placesList ns
    JOIN Cities c ON ns.city_id = c.city_id
    ORDER BY RAND()
    LIMIT 2
  `; 

  pool.query(query, (err, results) => {
    if (err) {
      console.error('Query error:', err);
      res.status(500).json({ error: 'Server error' });
      return;
    }
    res.json(results);
  });
});

router.get('/listPlacesFiltered', (req, res) => {
  const music = req.query.music;
  const dressCode = req.query.dresscode;
  const cityName = req.query.cityName;

  let query = `
  SELECT *, ns.spot_id
    FROM placesList ns
    JOIN Cities c ON ns.city_id = c.city_id
    WHERE c.city_name = ?
  `;

  let conditions = [];
  conditions.push(cityName);

  if (music) {
    query += ' AND ns.Music LIKE ?';
    conditions.push(`%${music}%`);
  }
  
  if (dressCode) {
    query += ' AND ns.Dresscode LIKE ?';
    conditions.push(`%${dressCode}%`);
  }

  //console.log(conditions);
  query += ' ORDER BY RAND()';

  //console.log(query);

  pool.query(query, conditions, (err, results) => {
    if (err) {
      console.error('Query error:', err);
      res.status(500).json({ error: 'Server error' });
      return;
    }
    res.json(results);
  });
});

router.get('/suggestedPlaces', (req, res) => {
  const music = req.query.music;
  const dressCode = req.query.dresscode;
  const busiestDay = req.query.busiestday;
  const openingHours = req.query.openinghours;
  const pricing = req.query.pricing;
  const cuisine = req.query.cuisine;
  const category = req.query.category;
  const city_id = req.query.city_id;

  let query = `
  SELECT *, ns.spot_id
    FROM placesList ns
    JOIN Cities c ON ns.city_id = c.city_id
    WHERE 1=1
  `;

  let conditions = [];

  if (music) {
    query += ' AND ns.Music LIKE ?';
    conditions.push(`%${music}%`);
  }

  if (city_id) {
    query += ' AND ns.city_id = ?';
    conditions.push(city_id);
  }

  if (dressCode) {
    query += ' AND ns.Dresscode LIKE ?';
    conditions.push(`%${dressCode}%`);
  }

  if (busiestDay) {
    query += ' AND ns.busiest_day LIKE ?';
    conditions.push(`%${busiestDay}%`);
  }

  if (openingHours) {
    query += ' AND ns.opening_hours LIKE ?';
    conditions.push(`%${openingHours}%`);
  }

  if (pricing) {
    query += ' AND ns.range_value LIKE ?';
    conditions.push(`%${pricing}%`);
  }

  if (cuisine) {
    query += ' AND ns.cuisine LIKE ?';
    conditions.push(`%${cuisine}%`);
  }

  if (category) {
    query += ' AND ns.category LIKE ?';
    conditions.push(`%${category}%`);
  }

  query += ' ORDER BY RAND() LIMIT 8';

  pool.query(query, conditions, (err, results) => {
    if (err) {
      console.error('Query error:', err);
      res.status(500).json({ error: 'Server error' });
      return;
    }
    res.json(results);
  });
});

module.exports = router;
