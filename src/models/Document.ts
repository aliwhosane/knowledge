import mongoose, { Document as MongooseDocument, Schema } from 'mongoose';
import { IUser } from './User';

// Interface for quiz questions
interface IQuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

// Interface for generated questions
interface IGeneratedQuestion {
  question: string;
  answer: string;
}

// Interface to define the Document document structure
export interface IDocument extends MongooseDocument {
  user: IUser['_id'];
  originalFilename: string;
  storagePath: string;
  fileType: string;
  status: 'uploading' | 'processing' | 'ready' | 'error';
  summary?: string;
  generatedQuestions?: IGeneratedQuestion[];
  generatedQuiz?: IQuizQuestion[];
  uploadedAt: Date;
}

// Create the Document schema
const documentSchema = new Schema<IDocument>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required for a document']
  },
  originalFilename: {
    type: String,
    required: [true, 'Original filename is required']
  },
  storagePath: {
    type: String,
    required: [true, 'Storage path is required']
  },
  fileType: {
    type: String
  },
  status: {
    type: String,
    enum: ['uploading', 'processing', 'ready', 'error'],
    default: 'uploading'
  },
  summary: {
    type: String
  },
  generatedQuestions: [
    {
      question: String,
      answer: String
    }
  ],
  generatedQuiz: [
    {
      question: String,
      options: [String],
      correctAnswer: String
    }
  ],
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

// Index the user field for efficient querying
documentSchema.index({ user: 1 });

// Create and export the Document model
const DocumentModel = mongoose.model<IDocument>('Document', documentSchema);

export default DocumentModel;