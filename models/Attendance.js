const mongoose = require('mongoose');

// Define a schema for the collection
const dataSchema = new mongoose.Schema({
  MonthYear: { type: String, required: true },
  Date: { type: String, required: true },  // Change from String to Date
  Place: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, required: false },
});

// Export the model
const Attendance = mongoose.model('Attendance', dataSchema);

module.exports = Attendance;
