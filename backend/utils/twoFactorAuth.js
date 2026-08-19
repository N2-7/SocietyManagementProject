const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const crypto = require('crypto');

/**
 * Generate a TOTP secret for 2FA
 * @returns {Object} - Contains secret and QR code data
 */
const generateSecret = (email, serviceName = 'MyPlace Society') => {
  const secret = speakeasy.generateSecret({
    name: `${serviceName} (${email})`,
    issuer: serviceName,
    length: 32,
  });

  return secret;
};

/**
 * Generate QR code as data URL
 * @param {string} otpauthUrl - The OTP auth URL
 * @returns {Promise<string>} - QR code as data URL
 */
const generateQRCode = async (otpauthUrl) => {
  try {
    const qrCodeDataURL = await QRCode.toDataURL(otpauthUrl, {
      width: 200,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });
    return qrCodeDataURL;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
};

/**
 * Verify TOTP token
 * @param {string} secret - The user's secret
 * @param {string} token - The TOTP token from authenticator app
 * @param {object} options - Verification options
 * @returns {boolean} - Whether the token is valid
 */
const verifyToken = (secret, token, options = {}) => {
  return speakeasy.totp.verify({
    secret: secret,
    encoding: 'base32',
    token: token,
    window: options.window || 2, // Allow 2 time steps before/after for clock drift
  });
};

/**
 * Generate backup codes for account recovery
 * @param {number} count - Number of codes to generate
 * @returns {string[]} - Plain-text backup codes
 */
const generateBackupCodes = (count = 8) => {
  const codes = [];
  for (let i = 0; i < count; i++) {
    codes.push(crypto.randomBytes(4).toString('hex').toUpperCase());
  }
  return codes;
};

/**
 * Generate a backup code for manual entry
 * @returns {string} - 6-digit backup code
 */
const generateBackupCode = () => {
  return speakeasy.generateSecret({ length: 20 }).base32;
};

module.exports = {
  generateSecret,
  generateQRCode,
  verifyToken,
  generateBackupCodes,
  generateBackupCode,
};
