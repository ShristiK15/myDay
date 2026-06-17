import crypto from 'crypto';
import User from '../models/User.js';
import { signToken } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const sendUserResponse = (user, token, res) => {
  res.json({
    ...(token && { token }),
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      theme: user.theme,
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      reminders: user.reminders,
      createdAt: user.createdAt,
    },
  });
};

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Please provide name, email, and password' });
  }
  if (await User.findOne({ email })) {
    return res.status(400).json({ message: 'Email already registered' });
  }
  const user = await User.create({ name, email, password });
  sendUserResponse(user, signToken(user._id), res);
});

export const login = asyncHandler(async (req, res) => {
  const { email, password, rememberMe } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }
  const expiresIn = rememberMe ? '30d' : process.env.JWT_EXPIRES_IN || '7d';
  const token = signToken(user._id);
  if (rememberMe) {
    // token already uses default; client stores longer if rememberMe
  }
  user.password = undefined;
  sendUserResponse(user, token, res);
});

export const googleLogin = asyncHandler(async (req, res) => {
  const { email, name, avatar } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }
  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({ email, name: name || email.split('@')[0], avatar: avatar || '' });
  } else if (avatar) {
    user.avatar = avatar;
    await user.save();
  }
  sendUserResponse(user, signToken(user._id), res);
});

export const getMe = asyncHandler(async (req, res) => {
  sendUserResponse(req.user, null, res);
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.json({ message: 'If that email exists, a reset link was sent' });
  }
  const token = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');
  user.resetPasswordExpires = Date.now() + 3600000;
  await user.save();

  const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${token}`;
  // In production, send email via nodemailer
  if (process.env.NODE_ENV === 'development') {
    console.log('Reset URL:', resetUrl);
  }
  res.json({ message: 'If that email exists, a reset link was sent', ...(process.env.NODE_ENV === 'development' && { resetUrl }) });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const hashed = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const user = await User.findOne({
    resetPasswordToken: hashed,
    resetPasswordExpires: { $gt: Date.now() },
  }).select('+password');

  if (!user) return res.status(400).json({ message: 'Invalid or expired token' });

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();
  sendUserResponse(user, signToken(user._id), res);
});
