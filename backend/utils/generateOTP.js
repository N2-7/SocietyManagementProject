/**
 * Generate a 6-digit OTP
 */
const generateOTP = () => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  return otp;
};

/**
 * Calculate OTP expiry time (5 minutes from now)
 */
const getOTPExpiry = () => {
  const expiry = new Date();
  expiry.setMinutes(expiry.getMinutes() + 5);
  return expiry;
};

module.exports = { generateOTP, getOTPExpiry };
