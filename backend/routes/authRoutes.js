const express = require('express');
const router = express.Router();
const {
  register,
  login,
  refreshToken,
  logout,
  getMe,
  updateProfile,
  changePassword,
  verifyOTP,
  cleanupExpiredOTP,
  forgotPassword,
  verifyForgotPasswordOTP,
  resetPassword,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Public routes
router.post('/register', register);
router.post('/verify-otp', verifyOTP);
router.post('/login', login);
router.post('/refresh', refreshToken);
router.post('/forgot-password', forgotPassword);
router.post('/verify-forgot-otp', verifyForgotPasswordOTP);
router.post('/reset-password', resetPassword);

// Protected routes
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.put('/updateprofile', protect, updateProfile);
router.put('/changepassword', protect, changePassword);

module.exports = router;
