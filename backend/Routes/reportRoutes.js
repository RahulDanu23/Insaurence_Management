const express = require('express');
const Router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { 
  totalActivePolicies, 
  totalClaimsSubmitted, 
  totalCustomerRegistered, 
  totalPremiumCollected 
} = require('../Controllers/reportController');

// All reports should be restricted to Admin and Agent only
Router.use(authMiddleware);
Router.use(roleMiddleware(['Admin', 'Agent']));

Router.get('/total-customers', totalCustomerRegistered);
Router.get('/active-policies', totalActivePolicies);
Router.get('/total-claims', totalClaimsSubmitted);
Router.get('/premium-collected', totalPremiumCollected);

module.exports = Router;
