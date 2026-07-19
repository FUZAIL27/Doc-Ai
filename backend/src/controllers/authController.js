// const jwt = require('jsonwebtoken');
// const crypto = require('crypto');
// const User = require('../models/User');

// const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, {
//   expiresIn: process.env.JWT_EXPIRES_IN || '7d'
// });

// exports.signup = async (req, res) => {
//   try {
//     const { name, email, password } = req.body;
//     if (!name || !email || !password) {
//       return res.status(400).json({ error: 'All fields are required.' });
//     }
//     if (password.length < 6) {
//       return res.status(400).json({ error: 'Password must be at least 6 characters.' });
//     }

//     const existing = await User.findOne({ email });
//     if (existing) return res.status(409).json({ error: 'Email already registered.' });

//     const user = await User.create({ name, email, password });
//     const token = signToken(user._id);

//     res.status(201).json({ token, user });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// exports.login = async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     if (!email || !password) {
//       return res.status(400).json({ error: 'Email and password are required.' });
//     }

//     const user = await User.findOne({ email }).select('+password');
//     if (!user || !(await user.comparePassword(password))) {
//       return res.status(401).json({ error: 'Invalid email or password.' });
//     }

//     user.lastLogin = new Date();
//     await user.save({ validateBeforeSave: false });

//     const token = signToken(user._id);
//     res.json({ token, user });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// exports.forgotPassword = async (req, res) => {
//   try {
//     const { email } = req.body;
//     const user = await User.findOne({ email });
//     if (!user) return res.status(404).json({ error: 'No account with that email.' });

//     const resetToken = crypto.randomBytes(32).toString('hex');
//     user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
//     user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 min
//     await user.save({ validateBeforeSave: false });

//     // In production, send email. For now return token for dev
//     res.json({
//       message: 'Password reset instructions sent.',
//       ...(process.env.NODE_ENV === 'development' && { resetToken })
//     });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// exports.resetPassword = async (req, res) => {
//   try {
//     const { token, password } = req.body;
//     const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

//     const user = await User.findOne({
//       resetPasswordToken: hashedToken,
//       resetPasswordExpires: { $gt: Date.now() }
//     });

//     if (!user) return res.status(400).json({ error: 'Invalid or expired reset token.' });

//     user.password = password;
//     user.resetPasswordToken = undefined;
//     user.resetPasswordExpires = undefined;
//     await user.save();

//     const jwtToken = signToken(user._id);
//     res.json({ token: jwtToken, user });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// exports.getMe = async (req, res) => {
//   res.json({ user: req.user });
// };


const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");

const signToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    }
  );
};

// ==================== SIGNUP ====================
exports.signup = async (req, res) => {
  try {
    console.log("========== SIGNUP REQUEST ==========");
    console.log("Headers:", req.headers);
    console.log("Body:", req.body);

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: "All fields are required.",
        received: req.body,
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: "Password must be at least 6 characters.",
      });
    }

    const existingUser = await User.findOne({
      email: email.toLowerCase(),
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: "Email already registered.",
      });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
    });

    const token = signToken(user._id);

    return res.status(201).json({
      success: true,
      message: "Signup successful.",
      token,
      user,
    });
  } catch (err) {
    console.error("Signup Error:");
    console.error(err);

    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

// ==================== LOGIN ====================
exports.login = async (req, res) => {
  try {
    console.log("========== LOGIN REQUEST ==========");
    console.log("Headers:", req.headers);
    console.log("Body:", req.body);

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Email and password are required.",
        received: req.body,
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase(),
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password.",
      });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password.",
      });
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = signToken(user._id);

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user,
    });
  } catch (err) {
    console.error("Login Error:");
    console.error(err);

    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

// ==================== FORGOT PASSWORD ====================
exports.forgotPassword = async (req, res) => {
  try {
    console.log("Forgot Password Body:", req.body);

    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: "Email is required.",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase(),
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "No account found with this email.",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;

    await user.save({ validateBeforeSave: false });

    return res.status(200).json({
      success: true,
      message: "Password reset token generated.",
      resetToken,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

// ==================== RESET PASSWORD ====================
exports.resetPassword = async (req, res) => {
  try {
    console.log("Reset Password Body:", req.body);

    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        error: "Token and password are required.",
      });
    }

    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: {
        $gt: Date.now(),
      },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: "Invalid or expired token.",
      });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    const jwtToken = signToken(user._id);

    return res.status(200).json({
      success: true,
      message: "Password reset successful.",
      token: jwtToken,
      user,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

// ==================== GET CURRENT USER ====================
exports.getMe = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};