const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.json());

const placesRoutes = require('./routes/places');
const usersRoutes = require('./routes/users');

// Utilizza le rotte per le chiamate API relative ai luoghi
app.use('/api', placesRoutes);

// Utilizza le rotte per le chiamate API relative agli utenti
app.use('/users', usersRoutes);

// Altre configurazioni e middleware dell'app Express
// ...

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

