const express = require('express');
const router = express.Router();
const {
  createCustomerProfile,
  addCustomerByStaff,
  getMyProfile,
  updateCustomerProfile,
  deleteCustomerProfile,
  getAllCustomers,
  deleteCustomerById
} = require('../Controllers/customerController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.use(authMiddleware);

router.post('/create-profile', createCustomerProfile);
router.post('/add-by-staff', roleMiddleware(['Admin', 'Agent']), addCustomerByStaff);
router.get('/get-profile', getMyProfile);
router.put('/update-profile', updateCustomerProfile);
router.delete('/delete-profile', deleteCustomerProfile);
router.get('/get-all', authMiddleware, roleMiddleware(['Admin', 'Agent']), getAllCustomers);
router.delete('/delete-customer/:id', authMiddleware, roleMiddleware(['Admin', 'Agent']), deleteCustomerById);

module.exports = router;
