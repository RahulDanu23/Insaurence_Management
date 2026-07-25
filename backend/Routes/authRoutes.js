const express = require('express');
const router = express.Router();
const { register, login, logout, getAllAgents, changePassword, resetPassword } = require('../Controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/reset-password', resetPassword);
router.get('/agents', authMiddleware, roleMiddleware(['Admin']), getAllAgents);
router.put('/change-password', authMiddleware, changePassword);

module.exports = router;
