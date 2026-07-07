import mongoose, { Schema, Document } from 'mongoose';

export interface ISubscriber extends Document {
  chatId: string;
  type: 'private' | 'group' | 'supergroup' | 'channel';
  title?: string;
  username?: string;
  languageFilter?: string; // Legacy field
  languages: string[]; // List of subscribed languages e.g. ['python', 'rust']
  isActive: boolean;
  subscribedAt: Date;
}

const SubscriberSchema: Schema = new Schema(
  {
    chatId: { type: String, required: true, unique: true },
    type: { type: String, enum: ['private', 'group', 'supergroup', 'channel'], default: 'private' },
    title: { type: String },
    username: { type: String },
    languageFilter: { type: String, default: 'all' },
    languages: { type: [String], default: [] },
    isActive: { type: Boolean, default: true },
    subscribedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.Subscriber ||
  mongoose.model<ISubscriber>('Subscriber', SubscriberSchema);
