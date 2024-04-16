const express = require('express');
const app = express();
require('dotenv').config();
const bodyParser = require('body-parser');
const { pool, sequelize } = require('./mysql');
const cors = require('cors');

app.use(bodyParser.json());
app.use(cors()); 

const placesRoutes = require('./routes/places');
const usersRoutes = require('./routes/users');
const planActionsRoutes = require('./routes/planActions');
const placeProfile = require('./routes/placeProfile');
const userPlansRoute = require('./routes/userPlan')

app.get('/', (req, res) => {
  res.json({ message: 'API di esempio su Vercel!' });
});

app.use('/api', placesRoutes);

app.use('/api/places-profile', placeProfile);
app.use('/api/plans', userPlansRoute);

app.use('/users', usersRoutes);
app.use('/planActions', planActionsRoutes);

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);

  pool.query('SELECT 1 + 1', (err, rows) => {
    if (err) {
      console.error('Query error:', err);
      return;
    }
    console.log('Query executed successfully:', rows);
  });
  sequelize.authenticate().then(async() => {
    console.log('Sequelize connected');
  });
});
