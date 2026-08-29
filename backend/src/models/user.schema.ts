import mongoose, { Schema, Document } from 'mongoose';

export interface IDownloadRecord {
  bookId: string;
  timestamp: Date;
}

export interface IUser extends Document {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'reader' | 'admin';
  downloadHistory: IDownloadRecord[];
}

const userSchema = new Schema<IUser>({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['reader', 'admin'], default: 'reader' },
  downloadHistory: [{
    bookId: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

export default mongoose.model<IUser>('User', userSchema);