const PremiumPayment = require('../config/PremiumPayment');
const Policy = require('../config/policies');
const Customer = require('../config/customerSchema');

let recordPremiumPayment = async (req, res) => {
  try {
    const { policy_id, amount, status } = req.body;
    
    if (!policy_id || !amount) {
      return res.status(400).json({ message: "Please provide policy_id and amount" });
    }

    // Verify if the policy exists
    const policyExists = await Policy.findById(policy_id);
    if (!policyExists) {
      return res.status(404).json({ message: "Policy not found" });
    }

    const payment = await PremiumPayment.create({
      policy_id,
      amount,
      status: status || 'Paid',
      agent_id: req.user._id,
      payment_method: 'Cash'
    });

    return res.status(201).json({ message: "Premium payment recorded successfully", payment });
  } catch (error) {
    return res.status(400).json({ message: "Internal server error", error: error.message });
  }
};

let checkPaymentHistory = async (req, res) => {
  try {
    // Allows filtering by policy_id if passed in query parameters
    const { policy_id } = req.query;
    let filter = policy_id ? { policy_id } : {};

    if (req.user.role === 'Agent') {
      const customers = await Customer.find({ agent_id: req.user._id });
      const customerIds = customers.map(c => c._id);
      const policies = await Policy.find({ customer_id: { $in: customerIds } });
      const policyIds = policies.map(p => p._id);
      filter.policy_id = { $in: policyIds };
    }

    const paymentList = await PremiumPayment.find(filter).populate({
      path: 'policy_id',
      populate: { path: 'customer_id' }
    }).populate('agent_id');
    return res.status(200).json(paymentList);
  } catch (error) {
    return res.status(400).json({ message: "Internal server error", error: error.message });
  }
};

let checkPolicy = async (req, res) => {
  try { 
    const { policy_id } = req.params;
    if (!policy_id) {
      return res.status(400).json({ message: "Please provide policy_id" });
    }

    const policy = await Policy.findById(policy_id);
    if (!policy) {
      return res.status(404).json({ message: "Policy not found" });
    }

    return res.status(200).json(policy);
  } catch (error) {
    return res.status(400).json({ message: "Internal server error", error: error.message });
  }
};

let getMyPayments = async (req, res) => {
  try {
    // Find the customer linked to the logged-in user
    const customer = await Customer.findOne({ user_id: req.user.id });
    if (!customer) {
      return res.status(404).json({ message: "Customer profile not found" });
    }

    // Find all policies belonging to this customer
    const policies = await Policy.find({ customer_id: customer._id });
    const policyIds = policies.map(p => p._id);

    // Find all payments linked to those policies
    const myPayments = await PremiumPayment.find({
      policy_id: { $in: policyIds }
    }).populate('policy_id');

    return res.status(200).json({
      message: "Your payment history fetched successfully",
      payments: myPayments
    });
  } catch (error) {
    return res.status(400).json({ message: "Internal server error", error: error.message });
  }
};

module.exports = {
  recordPremiumPayment,
  checkPaymentHistory,
  checkPolicy,
  getMyPayments
};