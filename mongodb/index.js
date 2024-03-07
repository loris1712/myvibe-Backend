const mongoose = require('mongoose');

mongoose.connect(
  'mongodb+srv://myvbemusr:7IpCjQpio9b1kcpv@auth-cluster.skh7rmf.mongodb.net/usr_srv',
);


const PlaceProfile = require('./models/PlaceProfile');


async function createPlaceProfile(placeProfile) {
    const newProfile = new PlaceProfile({
      placeId: 1,
      location: { type: 'Point', coordinates: [40.73061, -73.935242] },
      preferenceProfile: {
        music: ['RnB'],
        culture: [],
        outfit: [],
        mood: [],
        food: []
      },
    });
    const saved = await newProfile.save();
    return saved
}

module.exports = {
  createPlaceProfile,
};