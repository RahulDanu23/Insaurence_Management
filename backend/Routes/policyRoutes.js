const express = require('express');
const router = express.Router();
const {
  createPolicy,
  getAllPolicies,
  getMyPolicies,
  renewPolicy,
  cancelPolicy
} = require('../Controllers/policyController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.post('/create-policy', authMiddleware, roleMiddleware(['Admin', 'Agent']), createPolicy);
router.get('/all-policies', authMiddleware, roleMiddleware(['Admin', 'Agent']), getAllPolicies);
router.get('/my-policies', authMiddleware, getMyPolicies);
router.put('/renew-policy/:id', authMiddleware, roleMiddleware(['Admin', 'Agent']), renewPolicy);
router.put('/cancel-policy/:id', authMiddleware, roleMiddleware(['Admin', 'Agent']), cancelPolicy);

module.exports = router;
