import mongoose from 'mongoose';

const futureLetterSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, default: '' },
    content: { type: String, default: '' },
    openDate: { type: Date, required: true },
    status: { type: String, enum: ['Draft', 'Sealed', 'Opened'], default: 'Draft' },
    remindMe: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model('FutureLetter', futureLetterSchema);