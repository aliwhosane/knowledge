import mongoose, { Document as MongooseDocument, Schema } from 'mongoose';

export interface IChatLog extends MongooseDocument {
  user: mongoose.Types.ObjectId;
  document: mongoose.Types.ObjectId | null;
  query: string;
  response: string;
  timestamp: Date;
}

const chatLogSchema = new Schema<IChatLog>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  document: {
    type: Schema.Types.ObjectId,
    ref: 'Document',
    default: null
  },
  query: {
    type: String,
    required: true
  },
  response: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const ChatLog = mongoose.model<IChatLog>('ChatLog', chatLogSchema);

export default ChatLog;