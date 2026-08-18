const nodemailer = require('nodemailer');

/**
 * Send email using nodemailer with Gmail SMTP
 */
const sendEmail = async (options) => {
  console.log('Email configuration check:', {
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    user: process.env.EMAIL_USER,
    hasPassword: !!process.env.EMAIL_PASSWORD,
  });

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false, // Allow self-signed certificates
    },
    // Add connection timeout
    connectionTimeout: 10000, // 10 seconds
    greetingTimeout: 5000, // 5 seconds
    socketTimeout: 10000, // 10 seconds
  });

  const message = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
    attachments: options.attachments,
  };

  try {
    // Add timeout to the sendMail operation
    const info = await Promise.race([
      transporter.sendMail(message),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Email sending timeout')), 15000)
      )
    ]);
    console.log('Email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
};

module.exports = sendEmail;
