const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

// User registration route
router.post('/register', upload.single('image'), userController.register);

// Check email availability
router.get('/check-email', userController.checkEmail);

// Protected routes - require authentication
router.use(protect); // Apply authentication middleware to all routes below

// Admin only routes
router.get('/', userController.getAllUsers);
router.patch('/approve/:userId', userController.approvePayment);
router.patch('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);
router.post('/notify-expired/:userId', userController.notifyExpiredMember);

module.exports = router;