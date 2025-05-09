// src/models/User.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  repositories: mongoose.Types.ObjectId[];
  createdAt: Date;
  verificationCode: string; // Código temporal
  verificationCodeExpires: Date; // Expiración del código
}

const UserSchema: Schema = new Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  repositories: [{ type: Schema.Types.ObjectId, ref: 'Repository' }],
  createdAt: { type: Date, default: Date.now },
  
  verificationCode: { type: String }, // <-- Código temporal
  verificationCodeExpires: { type: Date }, // <-- Expiración del código
});


export default mongoose.model<IUser>('User', UserSchema);
