import mongoose, { Schema, Document } from 'mongoose';

export interface IDigestLog extends Document {
  repoUrl: string;
  repoName: string;
  sentAt: Date;
  period: string; // 'daily', 'weekly', 'monthly'
}

const DigestLogSchema: Schema = new Schema(
  {
    repoUrl: { type: String, required: true },
    repoName: { type: String, required: true },
    sentAt: { type: Date, default: Date.now },
    period: { type: String, default: 'daily' },
  },
  { timestamps: true }
);

// Index to easily query sent repos in the last N days
DigestLogSchema.index({ repoUrl: 1, sentAt: -1 });

export default mongoose.models.DigestLog ||
  mongoose.model<IDigestLog>('DigestLog', DigestLogSchema);
