const express = require('express');
const router = express.Router();
const { register, login, logout, getAllAgents } = require('../Controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/agents', authMiddleware, roleMiddleware(['Admin']), getAllAgents);

module.exports = router;
