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
  
  const query = `
    SELECT ns.spot_id, ns.name, ns.address, ns.opening_hours, ns.busiest_day, ns.food, ns.music, ns.dress_code, ns.reservation_required, ns.pricing, ns.phone_number, ns.quote, ns.image, ns.description, ns.cuisine, ns.category, ns.latitude, ns.longitude, GROUP_CONCAT(v.vibe_name SEPARATOR ', ') AS vibes
    FROM NightlifeSpots ns
    JOIN Cities c ON ns.city_id = c.city_id
    LEFT JOIN NightlifeSpots_Vibes nsv ON ns.spot_id = nsv.spot_id
    LEFT JOIN Vibes v ON nsv.vibe_id = v.vibe_id
    WHERE c.city_name = ?
    GROUP BY ns.spot_id;
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

// Migliori luoghi di Guam
router.get('/bestPlaces', (req, res) => {
  const cityName = req.query.cityName; // Assuming the city name is passed as a query parameter
  
  const query = `
  SELECT ns.spot_id, ns.name, ns.address, ns.opening_hours, ns.busiest_day, ns.food, ns.music, ns.dress_code, ns.reservation_required, ns.pricing, ns.phone_number, ns.quote, ns.image, ns.description, ns.cuisine, ns.category, ns.latitude, ns.longitude, GROUP_CONCAT(v.vibe_name SEPARATOR ', ') AS vibes
  FROM NightlifeSpots ns
  JOIN Cities c ON ns.city_id = c.city_id
  LEFT JOIN NightlifeSpots_Vibes nsv ON ns.spot_id = nsv.spot_id
  LEFT JOIN Vibes v ON nsv.vibe_id = v.vibe_id
  WHERE ns.pricing IN ("$$$", "$$$$") AND c.city_name = ?
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

//filtered
router.get('/placesFiltered', (req, res) => {
  const cityName = req.query.cityName;
  const category = req.query.category;
  const prices = req.query.price;
  const music = req.query.music;
  const dresscode = req.query.dresscode;
  const food = req.query.food;
  const reservation = req.query.reservation;

  let query = `
    SELECT ns.spot_id, ns.name, ns.address, ns.opening_hours, ns.busiest_day, ns.food, ns.music, ns.dress_code, ns.reservation_required, ns.pricing, ns.phone_number, ns.quote, ns.image, ns.description, ns.cuisine, ns.category, ns.latitude, ns.longitude, GROUP_CONCAT(v.vibe_name SEPARATOR ', ') AS vibes
    FROM NightlifeSpots ns
    JOIN Cities c ON ns.city_id = c.city_id
    LEFT JOIN NightlifeSpots_Vibes nsv ON ns.spot_id = nsv.spot_id
    LEFT JOIN Vibes v ON nsv.vibe_id = v.vibe_id
    WHERE 1=1
  `;

  const params = [];
 
  if (cityName) {
    query += ' AND c.city_name = ?';
    params.push(cityName);
  }

  if (category) {
    query += ' AND ns.category = ?';
    params.push(category);
  }

  if (prices) {
    const priceArray = prices.split(',');
    const placeholders = priceArray.map(() => '?').join(',');
    query += ` AND ns.pricing IN (${placeholders})`;
    params.push(...priceArray);
  }

  if (music) {
    query += ' AND ns.music = ?';
    params.push(music);
  }
  
  if (dresscode) {
    query += ' AND ns.dress_code = ?';
    params.push(dresscode);
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

router.get('/randomPlace', (req, res) => {
  
  const query = `
    SELECT ns.spot_id, ns.name, ns.address, ns.opening_hours, ns.busiest_day, ns.food, ns.music, ns.dress_code, ns.reservation_required, ns.pricing, ns.phone_number, ns.quote, ns.image, ns.description, ns.cuisine, ns.category, ns.latitude, ns.longitude 
    FROM NightlifeSpots ns
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

  let query = `
    SELECT ns.spot_id, ns.name, ns.address, ns.opening_hours, ns.busiest_day, ns.food, ns.music, ns.dress_code, ns.reservation_required, ns.pricing, ns.phone_number, ns.quote, ns.image, ns.description, ns.cuisine, ns.category, ns.latitude, ns.longitude
    FROM NightlifeSpots ns
    JOIN Cities c ON ns.city_id = c.city_id
  `;

  let conditions = [];

  if (music) {
    query += ' WHERE ns.music LIKE ?';
    conditions.push(`%${music}%`);
  }

  if (dressCode) {
    query += conditions.length > 0 ? ' AND' : ' WHERE';
    query += ' ns.dress_code LIKE ?';
    conditions.push(`%${dressCode}%`);
  }

  query += ' ORDER BY RAND()';

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

  let query = `
    SELECT ns.spot_id, ns.name, ns.address, ns.opening_hours, ns.busiest_day, ns.food, ns.music, ns.dress_code, ns.reservation_required, ns.pricing, ns.phone_number, ns.quote, ns.image, ns.description, ns.cuisine, ns.category, ns.latitude, ns.longitude
    FROM NightlifeSpots ns
    JOIN Cities c ON ns.city_id = c.city_id
    WHERE 1=1
  `;

  let conditions = [];

  if (music) {
    query += ' AND ns.music LIKE ?';
    conditions.push(`%${music}%`);
  }

  if (dressCode) {
    query += ' AND ns.dress_code LIKE ?';
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
    query += ' AND ns.pricing LIKE ?';
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
