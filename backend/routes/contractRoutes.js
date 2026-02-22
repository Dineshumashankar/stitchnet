const express = require('express');
const router = express.Router();
const contractController = require('../controllers/contractController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, contractController.createContract);
router.get('/', authMiddleware, contractController.getContracts);
router.post('/:contractId/sign', authMiddleware, contractController.signContract);

module.exports = router;
