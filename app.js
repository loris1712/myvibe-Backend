const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors'); // Aggiungi questa riga per importare il modulo CORS

app.use(bodyParser.json());
app.use(cors()); // Usa il middleware CORS per abilitare le richieste da tutti gli origini

const placesRoutes = require('./routes/places');
const usersRoutes = require('./routes/users');
const planActionsRoutes = require('./routes/planActions');
const placeProfile = require('./routes/placeProfile')

app.get('/', (req, res) => {
  res.json({ message: 'API di esempio su Vercel!' });
});  

// Utilizza le rotte per le chiamate API relative ai luoghi
app.use('/api', placesRoutes);

app.use('/api/places-profile', placeProfile);

// Utilizza le rotte per le chiamate API relative agli utenti
app.use('/users', usersRoutes);
app.use('/planActions', planActionsRoutes);

// Altre configurazioni e middleware dell'app Express
// ...

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

