const QRCode = require('qrcode');

/**
 * Generate QR Code for visitor
 */
const generateQRCode = async (data) => {
  try {
    const qrCode = await QRCode.toDataURL(JSON.stringify(data));
    return qrCode;
  } catch (error) {
    throw new Error('Error generating QR code');
  }
};

module.exports = generateQRCode;
