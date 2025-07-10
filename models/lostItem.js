const mongoose = require('mongoose');

const lostItemSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  itemName: String,
  description: String,
  dateLost: Date,
  location: String,
  contactInfo: String,
  photoUrl: String
});

module.exports = mongoose.model('LostItem', lostItemSchema);
