const Customer = require('../config/customerSchema');
const Policy = require('../config/policies');
const Claim = require('../config/claims');
const PremiumPayment = require('../config/PremiumPayment');

const totalCustomerRegistered = async(req, res) => {
  try {
    const data = await Customer.find()
    const count = await Customer.countDocuments()
    return res.status(200).json({message : "Total customer registered", count, data})
  } catch (error) {
    return res.status(400).json({message : "Internal server error"})
  }
}

const totalActivePolicies = async(req, res)=> {
  try {
    // Note: the schema field is 'policy_status'
    const data = await Policy.find({policy_status: 'Active'});
    const count = await Policy.countDocuments({policy_status: 'Active'});
    return res.status(200).json({message: "Total active policies", count, data})
  } catch (error) {
    return res.status(400).json({
      message: "Internal server error"
    })
  }
}

const totalClaimsSubmitted = async(req, res)=> {
  try {
    const data = await Claim.find();
    const count = await Claim.countDocuments();
    return res.status(200).json({
      message: "Claim fetched Successfully", count, data
    })
  } catch(error) {
    return res.status(400).json({
      message: "Internal server error"
    })
  }
}

const totalPremiumCollected = async(req, res)=> {
  try {
    // Note: the schema field is 'status', and value is 'Paid'
    const data = await PremiumPayment.find({status : "Paid"})
    
    // Calculate total amount sum
    let totalSum = 0;
    data.forEach(payment => {
      totalSum += payment.amount;
    });

    return res.status(200).json({
      message: "Premium Payment Details", totalAmount: totalSum, data
    })
  } catch (error) {
    return res.status(400).json({
      message: "Internal server error"
    })
  }
}

module.exports = {
  totalActivePolicies,
  totalClaimsSubmitted,
  totalCustomerRegistered,
  totalPremiumCollected
}