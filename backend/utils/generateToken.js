const jwt = require('jsonwebtoken');

/**
 * Generate JWT Token
 */
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

/**
 * Generate Refresh Token
 */
const generateRefreshToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRE,
  });
};

module.exports = { generateToken, generateRefreshToken };
