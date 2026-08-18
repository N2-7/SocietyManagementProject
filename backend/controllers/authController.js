const User = require('../models/User');
const { generateToken, generateRefreshToken } = require('../utils/generateToken');
const { generateOTP, getOTPExpiry } = require('../utils/generateOTP');
const sendEmail = require('../utils/sendEmail');
const jwt = require('jsonwebtoken');

/**
 * @desc    Register new user (send OTP)
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.register = async (req, res) => {
  try {
    console.log('Registration request received:', req.body);
    const { name, email, flatNo, password, confirmPassword, phone, residentType } = req.body;

    // Validation
    if (!name || !email || !flatNo || !password || !confirmPassword) {
      console.log('Validation failed: Missing required fields');
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    if (password !== confirmPassword) {
      console.log('Validation failed: Passwords do not match');
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    // Check if user already exists
    console.log('Checking if user exists...');
    const userExists = await User.findOne({ $or: [{ email }, { flatNo }] });
    if (userExists) {
      console.log('User already exists:', userExists.email, userExists.flatNo);
      return res.status(400).json({ message: 'User already exists with this email or flat number' });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = getOTPExpiry();

    console.log('Generated OTP:', otp);

    // Store user data temporarily with OTP (you might want to use Redis or temp collection)
    // For now, we'll create a temporary user with OTP fields
    const tempUser = await User.create({
      name,
      email,
      flatNo,
      password,
      phone,
      role: 'resident',
      residentType: residentType || 'owner',
      status: 'pending_otp', // New status for OTP verification
      otp,
      otpExpiry,
    });

    console.log('Temporary user created with OTP:', tempUser._id);

    // Load logo image for email
    const fs = require('fs');
    const path = require('path');

    let logoPath = path.join(__dirname, '../assets/h.png');
    if (!fs.existsSync(logoPath)) {
      logoPath = path.join(__dirname, '../../h.png');
    }

    let logoBase64 = '';
    const attachments = [];

    if (fs.existsSync(logoPath)) {
      const logoBuffer = fs.readFileSync(logoPath);
      logoBase64 = `data:image/png;base64,${logoBuffer.toString('base64')}`;
      attachments.push({
        filename: 'h.png',
        path: logoPath,
        cid: 'society-logo',
      });
    }

    // Get frontend URL for other links
    const frontendUrl = process.env.CLIENT_URL || 'http://localhost:5173';

    // Send OTP email with professional template
    const message = `
      Dear ${name},

      Thank you for registering with MyPlace Smart Society Management System.

      Your verification code is: ${otp}

      This code will expire in 5 minutes.

      Your Registration Details:
      - Name: ${name}
      - Email: ${email}
      - Flat Number: ${flatNo}
      - Phone: ${phone}
      - Resident Type: ${residentType || 'owner'}

      If you did not request this code, please ignore this email.

      Best regards,
      MyPlace Team
    `;

    const htmlMessage = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification - MyPlace</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f0f2f5;
            margin: 0;
            padding: 20px;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 30px;
            text-align: center;
          }
          .logo {
            width: 100px;
            height: 100px;
            margin: 0 auto 20px;
            display: block;
            object-fit: contain;
            border-radius: 12px;
            border: 4px solid white;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            background: white;
          }
          .society-name {
            color: white;
            font-size: 28px;
            font-weight: bold;
            margin: 0;
          }
          .tagline {
            color: rgba(255, 255, 255, 0.9);
            font-size: 14px;
            margin: 5px 0 0;
          }
          .content {
            padding: 40px 30px;
          }
          .welcome {
            color: #333;
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          .message {
            color: #666;
            font-size: 16px;
            line-height: 1.6;
            margin-bottom: 30px;
          }
          .otp-container {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 25px;
            border-radius: 8px;
            text-align: center;
            margin: 30px 0;
          }
          .otp-label {
            color: white;
            font-size: 14px;
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .otp-code {
            color: white;
            font-size: 36px;
            font-weight: bold;
            letter-spacing: 8px;
            margin: 0;
          }
          .expiry {
            color: rgba(255, 255, 255, 0.8);
            font-size: 12px;
            margin-top: 10px;
          }
          .details {
            background: #f8f9fa;
            border-left: 4px solid #667eea;
            padding: 20px;
            margin: 30px 0;
            border-radius: 4px;
          }
          .details-title {
            color: #333;
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 15px;
          }
          .detail-row {
            display: flex;
            margin-bottom: 10px;
          }
          .detail-label {
            color: #666;
            font-weight: 500;
            width: 140px;
            font-size: 14px;
          }
          .detail-value {
            color: #333;
            font-weight: 600;
            font-size: 14px;
          }
          .footer {
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            border-top: 1px solid #e9ecef;
          }
          .footer-text {
            color: #666;
            font-size: 12px;
            margin: 5px 0;
          }
          .footer-link {
            color: #667eea;
            text-decoration: none;
          }
          .button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 12px 30px;
            border-radius: 6px;
            text-decoration: none;
            font-weight: bold;
            margin-top: 20px;
          }
          .icon {
            font-size: 48px;
            margin-bottom: 15px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="${attachments.length > 0 ? 'cid:society-logo' : logoBase64}" alt="MyPlace Society Logo" class="logo" />
            <h1 class="society-name">MyPlace</h1>
            <p class="tagline">Smart Society Management System</p>
          </div>
          
          <div class="content">
            <div style="text-align: center; margin-bottom: 20px;">
              <div class="icon">✉️</div>
              <h2 class="welcome">Welcome, ${name}!</h2>
              <p class="message">
                Thank you for registering with MyPlace. We're excited to have you as part of our community!
              </p>
            </div>

            <div class="otp-container">
              <div class="otp-label">Your Verification Code</div>
              <p class="otp-code">${otp}</p>
              <p class="expiry">⏰ This code will expire in 5 minutes</p>
            </div>

            <div class="details">
              <h3 class="details-title">📋 Your Registration Details</h3>
              <div class="detail-row">
                <span class="detail-label">👤 Full Name:</span>
                <span class="detail-value">${name}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">📧 Email:</span>
                <span class="detail-value">${email}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">🏢 Flat Number:</span>
                <span class="detail-value">${flatNo}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">📱 Phone:</span>
                <span class="detail-value">${phone}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">🔑 Resident Type:</span>
                <span class="detail-value">${residentType === 'owner' ? '🏠 Owner' : '📦 Tenant'}</span>
              </div>
            </div>

            <p class="message" style="text-align: center;">
              <strong>Next Steps:</strong> After verifying your email, your account will be pending admin approval. You'll be notified once your account is activated.
            </p>

            <div style="text-align: center;">
              <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/verify-otp" class="button">Verify Email Now</a>
            </div>
          </div>

          <div class="footer">
            <p class="footer-text">🏠 MyPlace - Smart Society Management</p>
            <p class="footer-text">
              If you didn't request this verification, please ignore this email.
            </p>
            <p class="footer-text">
              Need help? Contact us at <a href="mailto:${process.env.EMAIL_USER || 'support@myplace.com'}" class="footer-link">${process.env.EMAIL_USER || 'support@myplace.com'}</a>
            </p>
            <p class="footer-text" style="margin-top: 15px;">
              © 2024 MyPlace. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email asynchronously - don't wait for it
    sendEmail({
      email: email,
      subject: 'Verify your email - Smart Society Management',
      message: message,
      html: htmlMessage,
      attachments: attachments.length > 0 ? attachments : undefined,
    })
      .then(() => {
        console.log('OTP email sent successfully to:', email);
      })
      .catch((emailError) => {
        console.error('Error sending email:', emailError);
        console.error('Email error details:', {
          message: emailError.message,
          code: emailError.code,
          command: emailError.command,
          response: emailError.response,
        });
        
        // Delete the temporary user since email failed
        User.findByIdAndDelete(tempUser._id).catch(err => {
          console.error('Error deleting temp user after email failure:', err);
        });
      });

    // Return response immediately without waiting for email
    res.status(200).json({
      success: true,
      message: 'OTP sent to your email. Please verify to complete registration.',
      data: {
        email: tempUser.email,
        // Don't send the OTP back in response
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Verify OTP and complete registration
 * @route   POST /api/auth/verify-otp
 * @access  Public
 */
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Validation
    if (!email || !otp) {
      return res.status(400).json({ message: 'Please provide email and OTP' });
    }

    // Find user with email and include OTP fields
    const user = await User.findOne({ email }).select('+otp +otpExpiry');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user has OTP (was in pending_otp state)
    if (!user.otp || !user.otpExpiry) {
      return res.status(400).json({ message: 'No OTP was generated for this user' });
    }

    // Check if OTP is expired
    if (new Date() > user.otpExpiry) {
      // Delete the user since OTP expired
      await User.findByIdAndDelete(user._id);
      return res.status(400).json({ message: 'OTP has expired. Please register again.' });
    }

    // Check if OTP matches
    if (user.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // OTP is valid - clear OTP fields and update status
    user.otp = undefined;
    user.otpExpiry = undefined;
    user.status = 'pending'; // Now pending admin approval
    await user.save();

    console.log('OTP verified successfully for user:', user.email);

    res.status(200).json({
      success: true,
      message: 'Email verified successfully. Your account is now pending admin approval.',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        flatNo: user.flatNo,
        status: user.status,
      },
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = async (req, res) => {
  try {
    const { flatNo, password } = req.body;

    // Validation
    if (!flatNo || !password) {
      return res.status(400).json({ message: 'Please provide flat number and password' });
    }

    // Find user and include password for comparison
    const user = await User.findOne({ flatNo }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if user is blocked
    if (user.status === 'blocked') {
      return res.status(403).json({ message: 'Your account has been blocked. Contact admin.' });
    }

    // TEMPORARILY DISABLED: Skip status check for easier login
    // Check if user is pending approval (except for admin)
    // if (user.status === 'pending' && user.role !== 'admin') {
    //   return res.status(403).json({ message: 'Your account is pending approval from admin.' });
    // }

    // Check password
    const isPasswordMatch = await user.matchPassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate tokens
    const token = generateToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id, user.role);

    // Save refresh token to user document
    user.refreshToken = refreshToken;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        refreshToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          flatNo: user.flatNo,
          phone: user.phone,
          role: user.role,
          residentType: user.residentType,
          status: user.status,
          profileImage: user.profileImage,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Refresh access token
 * @route   POST /api/auth/refresh
 * @access  Public
 */
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token is required' });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    
    // Find user with this refresh token
    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    // Generate new tokens
    const newToken = generateToken(user._id, user.role);
    const newRefreshToken = generateRefreshToken(user._id, user.role);

    // Update refresh token
    user.refreshToken = newRefreshToken;
    await user.save();

    res.status(200).json({
      success: true,
      data: {
        token: newToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (error) {
    res.status(401).json({ message: 'Invalid refresh token' });
  }
};

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Private
 */
exports.logout = async (req, res) => {
  try {
    // Clear refresh token from user
    req.user.refreshToken = undefined;
    await req.user.save();

    res.status(200).json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/updateprofile
 * @access  Private
 */
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, profileImage } = req.body;

    const user = await User.findById(req.user.id);

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (profileImage) user.profileImage = profileImage;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Change password
 * @route   PUT /api/auth/changepassword
 * @access  Private
 */
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Please provide current and new password' });
    }

    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    const isPasswordMatch = await user.matchPassword(currentPassword);
    if (!isPasswordMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Send OTP for forgot password
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Please provide your email address' });
    }

    // Find user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ message: 'No user found with this email address' });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = getOTPExpiry();

    // Store OTP in user document
    user.forgotPasswordOTP = otp;
    user.forgotPasswordOTPExpiry = otpExpiry;
    await user.save();

    // Load logo image for email
    const fs = require('fs');
    const path = require('path');

    let logoPath = path.join(__dirname, '../assets/h.png');
    if (!fs.existsSync(logoPath)) {
      logoPath = path.join(__dirname, '../../h.png');
    }

    let logoBase64 = '';
    const attachments = [];

    if (fs.existsSync(logoPath)) {
      const logoBuffer = fs.readFileSync(logoPath);
      logoBase64 = `data:image/png;base64,${logoBuffer.toString('base64')}`;
      attachments.push({
        filename: 'h.png',
        path: logoPath,
        cid: 'society-logo',
      });
    }

    // Send OTP email
    const message = `
      Dear ${user.name},

      You have requested to reset your password for MyPlace Smart Society Management System.

      Your password reset verification code is: ${otp}

      This code will expire in 5 minutes.

      If you did not request this code, please ignore this email and your password will remain unchanged.

      Best regards,
      MyPlace Team
    `;

    const htmlMessage = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset - MyPlace</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f0f2f5;
            margin: 0;
            padding: 20px;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 30px;
            text-align: center;
          }
          .logo {
            width: 100px;
            height: 100px;
            margin: 0 auto 20px;
            display: block;
            object-fit: contain;
            border-radius: 12px;
            border: 4px solid white;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            background: white;
          }
          .society-name {
            color: white;
            font-size: 28px;
            font-weight: bold;
            margin: 0;
          }
          .tagline {
            color: rgba(255, 255, 255, 0.9);
            font-size: 14px;
            margin: 5px 0 0;
          }
          .content {
            padding: 40px 30px;
          }
          .welcome {
            color: #333;
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          .message {
            color: #666;
            font-size: 16px;
            line-height: 1.6;
            margin-bottom: 30px;
          }
          .otp-container {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 25px;
            border-radius: 8px;
            text-align: center;
            margin: 30px 0;
          }
          .otp-label {
            color: white;
            font-size: 14px;
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .otp-code {
            color: white;
            font-size: 36px;
            font-weight: bold;
            letter-spacing: 8px;
            margin: 0;
          }
          .expiry {
            color: rgba(255, 255, 255, 0.8);
            font-size: 12px;
            margin-top: 10px;
          }
          .warning {
            background: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .warning-text {
            color: #856404;
            font-size: 14px;
            margin: 0;
          }
          .footer {
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            border-top: 1px solid #e9ecef;
          }
          .footer-text {
            color: #666;
            font-size: 12px;
            margin: 5px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="${attachments.length > 0 ? 'cid:society-logo' : logoBase64}" alt="MyPlace Society Logo" class="logo" />
            <h1 class="society-name">MyPlace</h1>
            <p class="tagline">Smart Society Management System</p>
          </div>
          
          <div class="content">
            <h2 class="welcome">Password Reset Request</h2>
            <p class="message">You have requested to reset your password. Please use the following verification code to proceed:</p>
            
            <div class="otp-container">
              <p class="otp-label">Verification Code</p>
              <p class="otp-code">${otp}</p>
              <p class="expiry">Expires in 5 minutes</p>
            </div>
            
            <div class="warning">
              <p class="warning-text">⚠️ If you did not request this code, please ignore this email. Your password will remain unchanged.</p>
            </div>
          </div>
          
          <div class="footer">
            <p class="footer-text">This is an automated message from MyPlace Smart Society Management System</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email asynchronously - don't wait for it
    sendEmail({
      email: user.email,
      subject: 'Password Reset Verification Code - MyPlace',
      message,
      html: htmlMessage,
      attachments,
    })
      .then(() => {
        console.log('Password reset OTP sent successfully to:', user.email);
      })
      .catch((emailError) => {
        console.error('Error sending password reset email:', emailError);
      });

    res.status(200).json({
      success: true,
      message: 'Password reset OTP sent successfully',
    });
  } catch (error) {
    console.error('Error sending forgot password OTP:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Verify OTP for forgot password
 * @route   POST /api/auth/verify-forgot-otp
 * @access  Public
 */
exports.verifyForgotPasswordOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Please provide email and OTP' });
    }

    // Find user by email with OTP fields
    const user = await User.findOne({ email }).select('+forgotPasswordOTP +forgotPasswordOTPExpiry');

    if (!user) {
      return res.status(404).json({ message: 'No user found with this email address' });
    }

    // Check if OTP exists and is not expired
    if (!user.forgotPasswordOTP || !user.forgotPasswordOTPExpiry) {
      return res.status(400).json({ message: 'No OTP found. Please request a new OTP.' });
    }

    if (new Date() > user.forgotPasswordOTPExpiry) {
      return res.status(400).json({ message: 'OTP has expired. Please request a new OTP.' });
    }

    // Verify OTP
    if (user.forgotPasswordOTP !== otp) {
      return res.status(400).json({ message: 'Invalid OTP. Please try again.' });
    }

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
    });
  } catch (error) {
    console.error('Error verifying forgot password OTP:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Reset password with OTP
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword, confirmPassword } = req.body;

    if (!email || !otp || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Find user by email with OTP fields
    const user = await User.findOne({ email }).select('+forgotPasswordOTP +forgotPasswordOTPExpiry +password');

    if (!user) {
      return res.status(404).json({ message: 'No user found with this email address' });
    }

    // Check if OTP exists and is not expired
    if (!user.forgotPasswordOTP || !user.forgotPasswordOTPExpiry) {
      return res.status(400).json({ message: 'No OTP found. Please request a new OTP.' });
    }

    if (new Date() > user.forgotPasswordOTPExpiry) {
      return res.status(400).json({ message: 'OTP has expired. Please request a new OTP.' });
    }

    // Verify OTP
    if (user.forgotPasswordOTP !== otp) {
      return res.status(400).json({ message: 'Invalid OTP. Please try again.' });
    }

    // Update password
    user.password = newPassword;
    
    // Clear OTP fields
    user.forgotPasswordOTP = undefined;
    user.forgotPasswordOTPExpiry = undefined;
    
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successfully',
    });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ message: error.message });
  }
};
