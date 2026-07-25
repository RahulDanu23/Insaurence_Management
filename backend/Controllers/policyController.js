const Policy = require('../config/policies');
const Customer = require('../config/customerSchema');

const createPolicy = async (req, res) => {
  try {
    const { customer_id, policy_number, policy_type, policy_amount, policy_start_date, policy_end_date, policy_status } = req.body;

    const existingPolicy = await Policy.findOne({ policy_number });
    if (existingPolicy) {
      return res.status(400).json({ message: "Policy number already exists" });
    }

    const policy = await Policy.create({
      customer_id,
      policy_number,
      policy_type,
      policy_amount,
      policy_start_date,
      policy_end_date,
      policy_status
    });

    return res.status(201).json({ message: 'Policy created successfully', policy });
  } catch (error) {
    return res.status(400).json({ message: 'Internal server error', error: error.message });
  }
};

const getAllPolicies = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Extract query parameters for search and filters
    const search = req.query.search || '';
    const policy_status = req.query.policy_status || '';
    const policy_type = req.query.policy_type || '';

    // Build the query object dynamically
    let query = {};
    
    if (req.user.role === 'Agent') {
      const customers = await Customer.find({ agent_id: req.user._id });
      const customerIds = customers.map(c => c._id);
      query.customer_id = { $in: customerIds };
    }

    if (search) {
      query.$or = [
        { policy_number: { $regex: search, $options: 'i' } },
        { policy_type: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (policy_status) {
      query.policy_status = policy_status;
    }
    
    if (policy_type) {
      query.policy_type = policy_type;
    }

    const policiesList = await Policy.find(query)
                                     .populate('customer_id')
                                     .skip(skip)
                                     .limit(limit);
    
    const totalCount = await Policy.countDocuments(query);

    return res.status(200).json({
      policies: policiesList,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      totalPolicies: totalCount
    });
  } catch (error) {
    return res.status(400).json({ message: 'Internal server error', error: error.message });
  }
};

const getMyPolicies = async (req, res) => {
  try {
    // Find the customer linked to the logged-in user
    const customer = await Customer.findOne({ user_id: req.user.id });
    if (!customer) {
      return res.status(404).json({ message: 'Customer profile not found for this user' });
    }

    const myPolicies = await Policy.find({ customer_id: customer._id });
    return res.status(200).json(myPolicies);
  } catch (error) {
    return res.status(400).json({ message: 'Internal server error', error: error.message });
  }
};

const renewPolicy = async (req, res) => {
  try {
    const { policy_end_date } = req.body; 
    
    if (!policy_end_date) {
        return res.status(400).json({ message: 'Please provide a new policy_end_date to renew' });
    }

    const updatePolicy = await Policy.findByIdAndUpdate(
      req.params.id,
      { policy_end_date, policy_status: 'Active' },
      { returnDocument: 'after' }
    );
    if (!updatePolicy) {
      return res.status(404).json({ message: "Policy not found" });
    }
    return res.status(200).json({ message: "Policy renewed successfully", policy: updatePolicy });
  } catch (error) {
    return res.status(400).json({ message: 'Internal server error', error: error.message });
  }
};

const cancelPolicy = async (req, res) => {
  try {
    const updatePolicy = await Policy.findByIdAndUpdate(
      req.params.id,
      { policy_status: 'Cancelled' },
      { returnDocument: 'after' }
    );
    if (!updatePolicy) {
      return res.status(404).json({ message: "Policy not found" });
    }
    return res.status(200).json({ message: "Policy cancelled successfully", policy: updatePolicy });
  } catch (error) {
    return res.status(400).json({ message: 'Internal server error', error: error.message });
  }
};

module.exports = {
  createPolicy,
  getAllPolicies,
  getMyPolicies,
  renewPolicy,
  cancelPolicy
};
