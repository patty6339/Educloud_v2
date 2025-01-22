const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/authMiddleware');
const userController = require('../controllers/userController');
const { uploadProfileImage } = require('../middlewares/upload');

// Public routes
router.post('/login', userController.login);
router.post('/forgot-password', userController.forgotPassword);
router.post('/reset-password/:token', userController.resetPassword);

// Protected routes - require authentication only
router.use(protect);

// Keeping this comment as a placeholder

// Profile routes (available to all authenticated users)
router.get('/profile', userController.getProfile);
router.put('/profile', uploadProfileImage, userController.updateProfile);
router.put('/change-password', userController.changePassword);
router.put('/settings', userController.updateSettings);

// Admin only routes
const adminRouter = express.Router();
adminRouter.use(authorize(['admin']));
adminRouter.get('/', userController.getAllUsers);
adminRouter.get('/:id', userController.getUserById);
adminRouter.put('/:id', userController.updateUser);
adminRouter.delete('/:id', userController.deleteUser);

// Mount admin routes
router.use('/admin', adminRouter);

module.exports = router;
