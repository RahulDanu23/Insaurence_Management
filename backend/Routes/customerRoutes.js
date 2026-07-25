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
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname))
  }
});
const upload = multer({ storage: storage });

router.use(authMiddleware);

router.post('/create-profile', createCustomerProfile);
router.post('/add-by-staff', roleMiddleware(['Admin', 'Agent']), upload.single('profile_picture'), addCustomerByStaff);
router.get('/get-profile', getMyProfile);
router.put('/update-profile', updateCustomerProfile);
router.delete('/delete-profile', deleteCustomerProfile);
router.get('/get-all', authMiddleware, roleMiddleware(['Admin', 'Agent']), getAllCustomers);
router.delete('/delete-customer/:id', authMiddleware, roleMiddleware(['Admin', 'Agent']), deleteCustomerById);

module.exports = router;
