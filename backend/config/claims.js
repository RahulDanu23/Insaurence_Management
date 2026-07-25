const mongoose = require('mongoose');

const claimSchema = new mongoose.Schema({
  policy_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Policy",
    required: true
  },
  claim_amount: {
    type: Number,
    required: true
  },
  claim_reason: {
    type: String
  },
  claim_status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected"],
    default: "Pending"
  },
  submission_date: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Claim', claimSchema);
