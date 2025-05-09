// src/models/Repository.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IRepository extends Document {
  name: string;
  description?: string;
  type: 'personal' | 'public' | 'private';
  linkedToUser?: mongoose.Types.ObjectId;
  linkedToOrgUnit?: mongoose.Types.ObjectId;
  owner: mongoose.Types.ObjectId;
  members: mongoose.Types.ObjectId[];
  files: mongoose.Types.ObjectId[];
  createdAt: Date;
}

const RepositorySchema = new Schema<IRepository>({
  name: { type: String, required: true },
  description: { type: String },
  type: { type: String, enum: ['personal', 'public', 'private'], default: 'private' },
  linkedToUser: { type: Schema.Types.ObjectId, ref: 'User' },
  linkedToOrgUnit: { type: Schema.Types.ObjectId, ref: 'OrgUnit' }, // si tienes modelo de unidad organizacional
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  files: [{ type: Schema.Types.ObjectId, ref: 'File' }], // si más adelante tienes un modelo File
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IRepository>('Repository', RepositorySchema);
