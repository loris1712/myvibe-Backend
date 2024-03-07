const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PlaceProfileSchema = new Schema({
  id: Schema.ObjectId,
  placeId: String,
  location: Object,
  preferenceProfile: {
    music: [String],
    outfit: [String],
    culture: [String],
    mood: [String],
    food: [String],
  },
});

const PlaceProfile = mongoose.model('place_profile', PlaceProfileSchema);

module.exports = PlaceProfile;
