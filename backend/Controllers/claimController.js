const Claim = require('../config/claims');
const Policy = require('../config/policies');
const Customer = require('../config/customerSchema');

let submitClaim = async (req, res) => {
  try {
    const { policy_id, claim_amount, claim_reason } = req.body;
    const policy = await Policy.findById(policy_id);
    if (!policy) {
        return res.status(404).json({ message: "Policy not found" });
    }

    const approvedClaims = await Claim.find({ policy_id, claim_status: 'Approved' });
    const totalApprovedAmount = approvedClaims.reduce((sum, claim) => sum + claim.claim_amount, 0);
    const remainingCoverage = policy.policy_amount - totalApprovedAmount;

    if (Number(claim_amount) > remainingCoverage) {
        return res.status(400).json({ 
            message: `Claim amount exceeds remaining coverage. You can only claim up to $${remainingCoverage}.` 
        });
    }

    let query = {
      policy_id: policy_id,
      claim_amount: claim_amount
    };
    if (claim_reason) {
      query.claim_reason = claim_reason;
    }
    const existingClaim = await Claim.findOne(query);

    if (existingClaim) {
      return res.status(400).json({
        message: "Claim already exists!"
      });
    }

    const newClaim = await Claim.create({
      policy_id: policy_id,
      claim_amount: claim_amount,
      claim_reason: claim_reason
    });

    return res.status(201).json({
      message: "Claim submitted successfully!",
      claim: newClaim
    });

  } catch (error) {
    return res.status(400).json({
      message: "Internal server error",
      error: error.message
    });
  }
};

let getMyClaims = async (req, res) => {
  try {
    // Find the customer associated with the logged-in user
    const customer = await Customer.findOne({ user_id: req.user.id });
    if (!customer) {
      return res.status(404).json({ message: 'Customer profile not found' });
    }

    // Find all policies belonging to this customer
    const policies = await Policy.find({ customer_id: customer._id });
    const policyIds = policies.map(p => p._id);

    // Find claims linked to these policies
    const myClaims = await Claim.find({
      policy_id: { $in: policyIds }
    }).populate('policy_id');

    return res.status(200).json({
      message: "Claims fetched successfully!",
      claims: myClaims
    });

  } catch (error) {
    return res.status(400).json({
      message: "Internal server error",
      error: error.message
    });
  }
};

let getAllClaims = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const claim_status = req.query.claim_status || '';

    let query = {};
    if (claim_status) {
      query.claim_status = claim_status;
    }

    const allClaims = await Claim.find(query)
                                 .populate('policy_id')
                                 .skip(skip)
                                 .limit(limit);
    
    const totalCount = await Claim.countDocuments(query);

    return res.status(200).json({
      claims: allClaims,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      totalClaims: totalCount
    });
  } catch (error) {
    return res.status(400).json({
      message: "Internal server error",
      error: error.message
    });
  }
};

let updateClaims = async (req, res) => {
  try {
    const { claim_status } = req.body

    const updateClaim = await Claim.findByIdAndUpdate(
      req.params.id,
      { claim_status },
      { returnDocument: 'after' }
    );
    if (!updateClaim) {
      return res.status(404).json({
        message: "Claim not found"
      });
    }
    return res.status(200).json({
      message: "Claim updated successfully!",
      claim: updateClaim
    });
  } catch (error) {
    return res.status(400).json({
      message: "Internal server error",
      error: error.message
    });
  }
};

module.exports = {
  submitClaim,
  getMyClaims,
  getAllClaims,
  updateClaims
};