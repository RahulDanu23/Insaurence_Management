const customer = require('../config/customerSchema');
const User = require('../config/userModel');
const bcrypt = require('bcrypt');

let createCustomerProfile = async (req, res) => {
  try {
    const { dob, phone, address } = req.body;
    const user_id = req.user.id;

    const existingProfile = await customer.findOne({ user_id });
    if (existingProfile) {
      return res.status(400).json({
        message: "Customer profile already exists for the user"
      });
    }

    const profile = await customer.create({
      user_id,
      name: req.user.name,
      email: req.user.email,
      phone,
      dob,
      address
    });

    return res.status(201).json({ message: 'Customer profile created successfully'});
  } catch (error) {
    console.log('Create Profile Error:', error.message);
    return res.status(400).json({ message: 'Internal server error', error: error.message });
  }
};

let addCustomerByStaff = async (req, res) => {
  try {
    const { name, email, password, phone, dob, address } = req.body;


    // 1. Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists with this email!" });
    }

    const existingPhone = await customer.findOne({ phone });
    if (existingPhone) {
      return res.status(400).json({ message: "Customer with this phone number already exists!" });
    }

    // 2. Create the User (role = Customer)
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: 'Customer',
      mustChangePassword: true
    });
    await newUser.save();

    try {
      // 3. Create the Customer Profile
      const profile = await customer.create({
        user_id: newUser._id,
        name,
        email,
        phone,
        dob,
        address,
        agent_id: req.user.role === 'Agent' ? req.user._id : null,
        profile_picture: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0ea5e9&color=fff`
      });

      return res.status(201).json({ message: 'Customer account and profile created successfully!', profile });
    } catch (profileError) {
      // Rollback user creation if profile fails
      await User.findByIdAndDelete(newUser._id);
      throw profileError;
    }
  } catch (error) {
    console.log('Add Customer Error:', error.message);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

let getMyProfile = async (req, res) => {
  try {
    const profile = await customer.findOne({ user_id: req.user.id });
    if (!profile) {
      return res.status(404).json({ message: 'Customer profile not found' });
    }
    return res.status(200).json({
      message: 'Customer profile fetched successfully',
      profile
    });
  } catch (error) {
    console.log('Get Profile Error:', error.message);
    return res.status(400).json({ message: "Internal server error", error: error.message });
  }
};

let updateCustomerProfile = async (req, res) => {
  try {
    const { email, phone, address } = req.body;

    const updateProfile = await customer.findOneAndUpdate(
      { user_id: req.user.id },
      { email, phone, address },
      { returnDocument: 'after' }
    );

    if (!updateProfile) {
      return res.status(404).json({ message: "Customer profile not found" });
    }

    return res.status(200).json({
      message: "Customer profile updated successfully",
      profile: updateProfile
    });
  } catch (error) {
    console.log('Update Profile Error:', error.message);
    return res.status(400).json({ message: "Internal server error!", error: error.message });
  }
};

let deleteCustomerProfile = async (req, res) => {
  try {
    const deleteProfile = await customer.findOneAndDelete({ user_id: req.user.id });
    if (!deleteProfile) {
      return res.status(404).json({ message: "Customer profile not found" });
    }

    return res.status(200).json({
      message: "Customer profile deleted successfully"
    });
  } catch (error) {
    console.log('Delete Profile Error:', error.message);
    return res.status(400).json({ message: "Internal server error!", error: error.message });
  }
};

let getAllCustomers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';

    // Build search query
    let query = {};
    if (req.user.role === 'Agent') {
      query.agent_id = req.user._id;
    }

    if (search) {
      query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      };

    const customersList = await customer.find(query).skip(skip).limit(limit);
    const totalCount = await customer.countDocuments(query);

    return res.status(200).json({
      customers: customersList,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      totalCustomers: totalCount
    });
  } catch (error) {
    console.log('Get All Customers Error:', error.message);
    return res.status(400).json({ message: "Internal server error!", error: error.message });
  }
};

let deleteCustomerById = async (req, res) => {
  try {
    const customerId = req.params.id;
    const customerData = await customer.findById(customerId);
    
    if (!customerData) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // Role check
    if (req.user.role === 'Agent' && String(customerData.agent_id) !== String(req.user._id)) {
      return res.status(403).json({ message: "You don't have permission to delete this customer" });
    }

    // Find policies
    const Policy = require('../config/policies');
    const Claim = require('../config/claims');
    const PremiumPayment = require('../config/PremiumPayment');
    const policies = await Policy.find({ customer_id: customerId });
    const policyIds = policies.map(p => p._id);

    // Delete associated records
    await Claim.deleteMany({ policy_id: { $in: policyIds } });
    await PremiumPayment.deleteMany({ policy_id: { $in: policyIds } });
    await Policy.deleteMany({ customer_id: customerId });
    
    // Delete user and customer
    await User.findByIdAndDelete(customerData.user_id);
    await customer.findByIdAndDelete(customerId);

    return res.status(200).json({ message: "Customer and all associated records deleted successfully" });
  } catch (error) {
    console.log('Delete Customer By ID Error:', error.message);
    return res.status(500).json({ message: "Internal server error!", error: error.message });
  }
};

module.exports ={  createCustomerProfile,
  addCustomerByStaff,
  getMyProfile,
  updateCustomerProfile,
  deleteCustomerProfile,
  getAllCustomers,
  deleteCustomerById
}
