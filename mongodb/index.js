const mongoose = require('mongoose');

mongoose.connect(
  'mongodb+srv://myvbemusr:7IpCjQpio9b1kcpv@auth-cluster.skh7rmf.mongodb.net/usr_srv',
);

const PlaceProfile = require('./models/PlaceProfile');

async function createPlaceProfile(placeProfile) {
  const { location, preferenceProfile, placeId, address } = placeProfile;

  const existing = await PlaceProfile.findOne({ placeId });

  if (existing._id) {
    await PlaceProfile.deleteOne({
      placeId,
    });
  }

  const newProfile = new PlaceProfile({
    id: existing?.id,
    placeId: placeId,
    address: address,
    location: { type: 'Point', coordinates: [location?.lng, location?.lat] },
    preferenceProfile: {
      ...(preferenceProfile ?? {}),
    },
  });
  const saved = await newProfile.save();
  return saved;
}

async function createPlaceProfileBulk(places) {
  await PlaceProfile.insertMany(places, { ordered: false, silent: true });
}

async function updatePlaceProfile(placeProfileUpdate) {
  const placeId = placeProfileUpdate?.placeId;
  const placeProfile = await PlaceProfile.findOne({
    placeId: placeId,
  });

  if (!placeProfile) {
    return;
  }

  const { address, location, preferenceProfile } = placeProfileUpdate;

  const updateData = {};

  if (address) {
    updateData.address = address;
  }

  if (location?.lat && location?.lng) {
    updateData.location = {
      type: 'Point',
      coordinates: [location?.lat, location?.lng],
    };
  }

  if (preferenceProfile) {
    updateData.preferenceProfile = {
      ...placeProfile.preferenceProfile,
      ...preferenceProfile,
    };
  }

  await placeProfile.updateOne(updateData);

  return;
}

module.exports = {
  createPlaceProfile,
  createPlaceProfileBulk,
  updatePlaceProfile,
};
