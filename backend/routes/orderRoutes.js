const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

// Configure multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

router.post('/', authMiddleware, upload.single('image'), orderController.createOrder);
router.get('/', orderController.getOrders);
router.get('/my', authMiddleware, orderController.getMyOrders);
router.get('/applications', authMiddleware, orderController.getApplications);
router.post('/:orderId/apply', authMiddleware, orderController.applyForOrder);
router.patch('/applications/:appId/reject', authMiddleware, orderController.rejectApplication);
router.patch('/:orderId/status', authMiddleware, orderController.updateOrderStatus);


module.exports = router;
