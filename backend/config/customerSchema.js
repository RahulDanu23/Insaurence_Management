const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  agent_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  name: {
    type: String,
    required: true
  },
  dob: {
    type: Date,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: Number,
    required: true,
    unique: true
  },
  address: {
    type: String,
    required: true
  },
  profile_picture: {
    type: String,
    default: "https://ui-avatars.com/api/?name=User&background=0ea5e9&color=fff"
  }
}, { timestamps: true });

module.exports = mongoose.model('Customer', customerSchema);
