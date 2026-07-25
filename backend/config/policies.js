const mongoose = require('mongoose');

const policySchema = new mongoose.Schema({
  customer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true
  },
  policy_number: {
    type: String,
    required: true,
    unique: true
  },
  policy_type: {
    type: String,
    required: true
  },
  policy_amount: {
    type: Number,
    required: true
  },
  policy_start_date: {
    type: Date,
    required: true
  },
  policy_end_date: {
    type: Date,
    required: true
  },
  policy_status: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Policy', policySchema);
