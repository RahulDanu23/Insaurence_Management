const express = require('express');
const Router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { recordPremiumPayment, checkPaymentHistory, checkPolicy, getMyPayments } = require('../Controllers/premiumController');

Router.post('/recordPremiumPayment', authMiddleware, roleMiddleware(['Agent']), recordPremiumPayment);
Router.get('/my-payments', authMiddleware, getMyPayments);
Router.get('/checkPaymentHistory', authMiddleware, roleMiddleware(['Admin', 'Agent']), checkPaymentHistory);
Router.get('/checkPolicy/:policy_id', authMiddleware, checkPolicy);

module.exports = Router;