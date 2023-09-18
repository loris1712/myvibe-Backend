const express = require('express');
const router = express.Router();
const mysql = require('mysql');

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
    SELECT *
    FROM placesList ns
    JOIN Cities c ON ns.city_id = c.city_id
    LEFT JOIN NightlifeSpots_Vibes nsv ON ns.spot_id = nsv.spot_id
    LEFT JOIN Vibes v ON nsv.vibe_id = v.vibe_id
    JOIN users u ON u.id = ?
    WHERE c.city_name = ?
      AND FIND_IN_SET(u.Persona, ns.Personas) > 0;  
  `; 

  pool.query(query, [id, cityName], (err, results) => {
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
  SELECT *
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

router.get('/filteredHomePlaces', (req, res) => {
  const cityName = req.query.cityName;
  const filter = "%" + req.query.filter + "%";
  const reservationRequired = "%" + req.query.reservation_required + "%";
  const busiestDay = "%" + req.query.busiest_day + "%";

  let whereClause = "WHERE c.city_name = ?";
  const queryParams = [cityName];

  if (req.query.filter) {
    whereClause += " AND ns.category LIKE ?";
    queryParams.push(filter);
  }

  if (req.query.reservation_required) {
    whereClause += " AND ns.reservation_required LIKE ?";
    queryParams.push(reservationRequired);
  }

  if (req.query.busiest_day) {
    whereClause += " AND ns.busiest_day LIKE ?";
    queryParams.push(busiestDay);
  }

  const query = `
    SELECT *
    FROM placesList ns
    JOIN Cities c ON ns.city_id = c.city_id
    LEFT JOIN NightlifeSpots_Vibes nsv ON ns.spot_id = nsv.spot_id
    LEFT JOIN Vibes v ON nsv.vibe_id = v.vibe_id
    ${whereClause}
    GROUP BY ns.spot_id
    LIMIT 10
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
    SELECT *
    FROM placesList ns
    JOIN Cities c ON ns.city_id = c.city_id
    LEFT JOIN NightlifeSpots_Vibes nsv ON ns.spot_id = nsv.spot_id
    LEFT JOIN Vibes v ON nsv.vibe_id = v.vibe_id
    JOIN users u ON u.id = ? AND FIND_IN_SET(u.Persona, ns.personas) > 0
    WHERE 1=1
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

  console.log(params);
  console.log(query);

  pool.query(query, params, (err, results) => {
    if (err) {
      console.error('Query error:', err);
      res.status(500).json({ error: 'Server error' });
      return;
    }
    res.json(results);
    console.log(results);
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
    SELECT *
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
    SELECT *
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

  console.log(conditions);
  query += ' ORDER BY RAND()';

  console.log(query);

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
    SELECT *
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
