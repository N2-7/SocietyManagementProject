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
  });

  // Verify connection configuration
  try {
    await transporter.verify();
    console.log('SMTP server connection verified successfully');
  } catch (verifyError) {
    console.error('SMTP connection verification failed:', verifyError);
    throw new Error(`SMTP connection failed: ${verifyError.message}`);
  }

  const message = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
    attachments: options.attachments,
  };

  try {
    const info = await transporter.sendMail(message);
    console.log('Email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
};

module.exports = sendEmail;
