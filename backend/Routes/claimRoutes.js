const express = require('express');
const router = express.Router();
const {
  submitClaim,
  getMyClaims,
  getAllClaims,
  updateClaims
} = require('../Controllers/claimController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.use(authMiddleware);

router.post('/submit', submitClaim);
router.get('/my-claims', getMyClaims);
router.get('/all', roleMiddleware(['Admin', 'Agent']), getAllClaims);
router.put('/update-status/:id', roleMiddleware(['Admin', 'Agent']), updateClaims);

module.exports = router;
