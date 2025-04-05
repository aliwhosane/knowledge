import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './User';
import { IDocument } from './Document';

// Interface to define the Note document structure
export interface INote extends Document {
  user: IUser['_id'];
  document: IDocument['_id'];
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

// Create the Note schema
const noteSchema = new Schema<INote>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required for a note']
  },
  document: {
    type: Schema.Types.ObjectId,
    ref: 'Document',
    required: [true, 'Document is required for a note']
  },
  content: {
    type: String,
    required: [true, 'Content is required']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index the user and document fields for efficient querying
noteSchema.index({ user: 1 });
noteSchema.index({ document: 1 });

// Create and export the Note model
const Note = mongoose.model<INote>('Note', noteSchema);

export default Note;