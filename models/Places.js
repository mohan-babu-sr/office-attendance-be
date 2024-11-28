const mongoose = require('mongoose');

// Define a schema for the collection
const dataSchema = new mongoose.Schema({
  name: { type: String, required: true },
});

// Export the model
const Place = mongoose.model('places', dataSchema);

module.exports = Place;
