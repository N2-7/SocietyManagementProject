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
  setupTwoFactor,
  verifyTwoFactor,
  disableTwoFactor,
  verifyTwoFactorLogin,
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
router.post('/verify-2fa-login', verifyTwoFactorLogin);

// 2FA routes (protected)
router.post('/setup-2fa', protect, setupTwoFactor);
router.post('/verify-2fa', protect, verifyTwoFactor);
router.post('/disable-2fa', protect, disableTwoFactor);

// Protected routes
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.put('/updateprofile', protect, updateProfile);
router.put('/changepassword', protect, changePassword);

module.exports = router;
