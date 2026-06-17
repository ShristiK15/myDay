import FutureLetter from '../models/FutureLetter.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export const getLetters = asyncHandler(async (req, res) => {
  const letters = await FutureLetter.find({ userId: req.user._id }).sort({ openDate: 1 });
  const now = new Date();

  const waiting = [];
  const openable = [];
  const opened = [];

  for (const letter of letters) {
    if (letter.status === 'Opened') opened.push(letter);
    else if (letter.status === 'Sealed' && letter.openDate <= now) openable.push(letter);
    else waiting.push(letter);
  }

  res.json({ waiting, openable, opened, all: letters });
});

export const createLetter = asyncHandler(async (req, res) => {
  const letter = await FutureLetter.create({ ...req.body, userId: req.user._id });
  res.status(201).json(letter);
});

export const updateLetter = asyncHandler(async (req, res) => {
  const letter = await FutureLetter.findOne({ _id: req.params.id, userId: req.user._id });
  if (!letter) return res.status(404).json({ message: 'Letter not found' });
  if (letter.status === 'Opened') return res.status(400).json({ message: 'Cannot edit opened letter' });
  Object.assign(letter, req.body);
  await letter.save();
  res.json(letter);
});

export const sealLetter = asyncHandler(async (req, res) => {
  const letter = await FutureLetter.findOne({ _id: req.params.id, userId: req.user._id });
  if (!letter) return res.status(404).json({ message: 'Letter not found' });
  letter.status = 'Sealed';
  if (req.body.openDate) letter.openDate = req.body.openDate;
  await letter.save();
  res.json(letter);
});

export const openLetter = asyncHandler(async (req, res) => {
  const letter = await FutureLetter.findOne({ _id: req.params.id, userId: req.user._id });
  if (!letter) return res.status(404).json({ message: 'Letter not found' });
  if (letter.status === 'Sealed' && letter.openDate > new Date()) {
    return res.status(400).json({ message: 'Letter is still sealed' });
  }
  letter.status = 'Opened';
  await letter.save();
  res.json(letter);
});

export const deleteLetter = asyncHandler(async (req, res) => {
  await FutureLetter.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
  res.json({ message: 'Letter deleted' });
});
