import PDFDocument from 'pdfkit';
import User from '../models/User.js';
import Entry from '../models/Entry.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { uploadToCloudinary } from '../middleware/upload.js';

export const updateProfile = asyncHandler(async (req, res) => {
  const user = req.user;
  const { name, email, theme, reminders } = req.body;

  if (name) user.name = name;
  if (email) user.email = email;
  if (theme) user.theme = theme;
  if (reminders) {
    const r = typeof reminders === 'string' ? JSON.parse(reminders) : reminders;
    user.reminders = { ...(user.reminders?.toObject?.() || user.reminders || {}), ...r };
  }
  if (req.file) {
    user.avatar = await uploadToCloudinary(req.file.path, 'image');
  }
  await user.save();
  res.json({
    id: user._id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    theme: user.theme,
    reminders: user.reminders,
  });
});

export const changePassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('+password');
  const { currentPassword, newPassword } = req.body;
  if (!(await user.comparePassword(currentPassword))) {
    return res.status(400).json({ message: 'Current password is incorrect' });
  }
  user.password = newPassword;
  await user.save();
  res.json({ message: 'Password updated' });
});

export const exportJSON = asyncHandler(async (req, res) => {
  const entries = await Entry.find({ userId: req.user._id }).sort({ date: -1 });
  res.setHeader('Content-Disposition', 'attachment; filename=myday-journal.json');
  res.json({ exportedAt: new Date(), user: { name: req.user.name, email: req.user.email }, entries });
});

export const exportPDF = asyncHandler(async (req, res) => {
  const entries = await Entry.find({ userId: req.user._id }).sort({ date: 1 });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=myday-journal.pdf');

  const doc = new PDFDocument({ margin: 50 });
  doc.pipe(res);
  doc.fontSize(24).text('MyDay Journal Export', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Exported for ${req.user.name} — ${new Date().toLocaleDateString()}`);
  doc.moveDown(2);

  entries.forEach((entry) => {
    doc.fontSize(14).text(new Date(entry.date).toLocaleDateString(), { underline: true });
    if (entry.mood) doc.fontSize(10).text(`Mood: ${entry.mood}`);
    if (entry.title) doc.fontSize(12).text(entry.title, { continued: false });
    doc.fontSize(11).text(entry.content || '', { align: 'left' });
    doc.moveDown(1.5);
  });
  doc.end();
});

export const deleteAccount = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const user = await User.findById(req.user._id).select('+password');
  if (user.password && !(await user.comparePassword(password))) {
    return res.status(400).json({ message: 'Password required to delete account' });
  }
  await Entry.deleteMany({ userId: user._id });
  await user.deleteOne();
  res.json({ message: 'Account deleted' });
});
