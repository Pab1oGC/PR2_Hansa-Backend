import mongoose, { Document, Schema } from 'mongoose';

interface IFile extends Document {
  name: string;
  description: string;
  importance: 'alta' | 'media' | 'baja' | 'ninguna';
  tags: string[];
  privacy: 'public' | 'private';
  owner: mongoose.Types.ObjectId;
  originalName: string;
  mimeType: string;
  size: number;
  fileId: mongoose.Types.ObjectId; // ID generado por GridFS
  createdAt: Date;
}

const fileSchema = new Schema<IFile>(
  {
    name: { type: String, required: true },
    description: { type: String },
    importance: {
      type: String,
      enum: ['alta', 'media', 'baja', 'ninguna'],
      default: 'ninguna',
    },
    tags: [{ type: String }],
    privacy: {
      type: String,
      enum: ['public', 'private'],
      default: 'private',
    },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    fileId: { type: Schema.Types.ObjectId, required: true }, // ID del archivo en GridFS
  },
  { timestamps: true } // Genera createdAt y updatedAt automáticamente
);

const File = mongoose.model<IFile>('File', fileSchema);

export default File;
