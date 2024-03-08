const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PlaceProfileSchema = new Schema({
  id: Schema.ObjectId,
  placeId: {
    type: String,
    unique: true
  },
  location: Object,
  address: String,
  preferenceProfile: {
    music: [String],
    outfit: [String],
    culture: [String],
    mood: [String],
    food: [String],
  },
});

PlaceProfileSchema.index({ location: '2dsphere' });

const PlaceProfile = mongoose.model('place_profile', PlaceProfileSchema);

module.exports = PlaceProfile;
