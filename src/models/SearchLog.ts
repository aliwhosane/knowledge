import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './User';
import { IDocument } from './Document';

// Interface to define the SearchLog document structure
export interface ISearchLog extends Document {
  user: IUser['_id'];
  query: string;
  timestamp: Date;
  documentContext?: IDocument['_id'];
  foundResults: boolean;
}

// Create the SearchLog schema
const searchLogSchema = new Schema<ISearchLog>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required for a search log']
  },
  query: {
    type: String,
    required: [true, 'Search query is required']
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  documentContext: {
    type: Schema.Types.ObjectId,
    ref: 'Document'
  },
  foundResults: {
    type: Boolean,
    default: false
  }
});

// Index for efficient querying
searchLogSchema.index({ user: 1 });
searchLogSchema.index({ timestamp: -1 });

// Create and export the SearchLog model
const SearchLog = mongoose.model<ISearchLog>('SearchLog', searchLogSchema);

export default SearchLog;