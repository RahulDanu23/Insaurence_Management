const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  policy_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Policy',
    required: true
  }, 
  payment_date: {
    type: Date,
    default: Date.now
  },
  amount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['Paid', 'Pending', 'Failed'],
    default: 'Pending'
  },
  agent_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  payment_method: {
    type: String,
    enum: ['Cash'],
    default: 'Cash'
  }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
