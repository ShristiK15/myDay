import mongoose from 'mongoose';

const monthlyReflectionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    year: { type: Number, required: true },
    month: { type: Number, required: true },
    achievement: { type: String, default: '' },
    lesson: { type: String, default: '' },
    challenge: { type: String, default: '' },
    favoriteMemory: { type: String, default: '' },
    favoriteEntryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Entry' },
    completed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

monthlyReflectionSchema.index({ userId: 1, year: 1, month: 1 }, { unique: true });

export default mongoose.model('MonthlyReflection', monthlyReflectionSchema);
