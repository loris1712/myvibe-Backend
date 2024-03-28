const express = require('express');
const router = express.Router();

const {
  createPlaceProfile,
  createPlaceProfileBulk,
  placesDiscovery,
} = require('../mongodb/index');

const pool = require('../mysql').pool;

router.get('/migrate', (req, resp) => {
  // ;
  pool.query('SELECT * FROM placesList', async (err, results) => {
    if (err) {
      return;
    }
    const placesFormat = results?.map((place) => ({
      placeId: place?.spot_id,
      address: place?.full_address,
      location: {
        lat: Number(place.latitude?.trim().replace(',', '.')),
        lng: Number(place.longitude?.trim().replace(',', '.')),
      },
      preferenceProfile: {
        music: String(place?.Music ?? '')
          .split(',')
          ?.map((item) => item.toLocaleLowerCase().trim()),
        outfit: String(place?.Dresscode ?? '')
          .split(',')
          ?.map((item) => item.toLocaleLowerCase().trim()),
        culture: String(place?.Culture ?? '')
          .split(',')
          ?.map((item) => item.toLocaleLowerCase().trim()),
        mood: String(place?.Mood ?? '')
          .split(',')
          ?.map((item) => item.toLocaleLowerCase().trim()),
        food: String(place?.Food ?? '')
          .split(',')
          ?.map((item) => item.toLocaleLowerCase().trim()),
      },
    }));
    try {
      await createPlaceProfileBulk(placesFormat);
      return resp.status(201).send({
        message: 'Migration done',
      });
    } catch (e) {
      return resp.status(500).send(e);
    }
  });
});

router.post('/', async (req, resp) => {
  const profile = req.body;

  if (!profile?.placeId) {
    return resp.status(400).send({
      code: 400,
      message: 'placeId field is required',
    });
  }

  if (!profile?.address) {
    return resp.status(400).send({
      code: 400,
      message: 'address field is required',
    });
  }

  if (!profile?.location?.lat || !profile?.location?.lng) {
    return resp.status(400).send({
      code: 400,
      message: 'location information is required',
    });
  }

  const saved = await createPlaceProfile(profile);
  resp.status(201).send({
    data: saved,
  });
});

router.post('/discover', async (req, resp) => {
  const body = req.body;
  const places = await placesDiscovery(body);
  const placeIds = places?.map((place) => Number(place?.placeId));
  if(placeIds?.length <= 0){
    return resp.status(200).send({
        data: [],
      });
  }
  const placesDetails = `SELECT * FROM placesList where spot_id in (${placeIds})`;
  pool.query(placesDetails, (er, results) => {
    if (er) {
      console.log(er);
      return resp.status(200).send({
        data: [],
      });
    }
    return resp.status(200).send({
      data: results,
    });
  });
});

module.exports = router;
