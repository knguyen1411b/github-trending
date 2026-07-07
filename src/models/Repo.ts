import mongoose, { Schema, Document } from 'mongoose';

export interface IContributor {
  username: string;
  avatar: string;
  url: string;
}

export interface IRepo extends Document {
  author: string;
  name: string;
  avatar?: string;
  url: string;
  description: string;
  language?: string;
  languageColor?: string;
  stars: number;
  forks: number;
  currentPeriodStars: number; // stars gained today/this week
  builtBy: IContributor[];
  aiSummary?: {
    purpose: string;
    highlights: string;
    useCases: string;
    updatedAt: Date;
  };
  lastScrapedAt: Date;
}

const RepoSchema: Schema = new Schema(
  {
    author: { type: String, required: true },
    name: { type: String, required: true },
    avatar: { type: String },
    url: { type: String, required: true, unique: true },
    description: { type: String, default: '' },
    language: { type: String, default: 'Unknown' },
    languageColor: { type: String, default: '#8b949e' },
    stars: { type: Number, default: 0 },
    forks: { type: Number, default: 0 },
    currentPeriodStars: { type: Number, default: 0 },
    builtBy: [
      {
        username: { type: String },
        avatar: { type: String },
        url: { type: String },
      },
    ],
    aiSummary: {
      purpose: { type: String },
      highlights: { type: String },
      useCases: { type: String },
      updatedAt: { type: Date, default: Date.now },
    },
    lastScrapedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.Repo || mongoose.model<IRepo>('Repo', RepoSchema);
