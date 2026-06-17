import mongoose from 'mongoose';

const MOODS = ['Sad', 'Neutral', 'Okay', 'Happy', 'Amazing'];
const MOOD_SCORES = { Sad: 1, Neutral: 2, Okay: 3, Happy: 4, Amazing: 5 };

const entrySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, default: '' },
    content: { type: String, default: '' },
    mood: { type: String, enum: MOODS },
    photoUrl: { type: String, default: '' },
    voiceNoteUrl: { type: String, default: '' },
    reflectionPrompt: { type: String, default: '' },
    reflectionAnswer: { type: String, default: '' },
    date: { type: Date, required: true, index: true },
  },
  { timestamps: true }
);

entrySchema.index({ userId: 1, date: -1 });//sorts userid in ascending order and date in descending order.
entrySchema.statics.MOODS = MOODS;//This makes MOODS available directly on the model.This makes MOODS available directly on the model.
entrySchema.statics.MOOD_SCORES = MOOD_SCORES;

export default mongoose.model('Entry', entrySchema);
