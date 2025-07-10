const mongoose = require('mongoose');

const foundItemSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  itemName: String,
  description: String,
  dateFound: Date,
  location: String,
  contactInfo: String,
  photoUrl: String
});

module.exports = mongoose.model('FoundItem', foundItemSchema);
