import { Request, Response } from 'express';
import { getChatResponse } from '../services/geminiService';
import { extractTextFromFile } from '../services/textExtractorService';
import Document from '../models/Document';
import ChatLog from '../models/ChatLog';

/**
 * Handle chat messages and generate responses
 */
export const handleChatMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { message, documentId } = req.body;
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized - User not authenticated' });
      return;
    }
    const userId = req.user.id;

    if (!message) {
      res.status(400).json({ message: 'Message is required' });
      return;
    }

    let documentContext = '';
    let document = null;

    // If documentId is provided, fetch the document content for context
    if (documentId) {
      document = await Document.findById(documentId);
      
      if (!document) {
        res.status(404).json({ message: 'Document not found' });
        return;
      }

      // Check if the document belongs to the user
      if (document.user?.toString() !== userId) {
        res.status(403).json({ message: 'Not authorized to access this document' });
        return;
      }
      
      console.log("document", document);
      
      // Extract text from the document file if storagePath exists
      if (document.storagePath && document.fileType) {
        try {
          documentContext = await extractTextFromFile(document.storagePath, document.fileType);
        } catch (extractError) {
          console.error('Error extracting text from document:', extractError);
          // Fallback to summary if text extraction fails
          documentContext = document.summary || '';
        }
      } else {
        // Fallback to summary if storagePath doesn't exist
        documentContext = document.summary || '';
      }
    }

    // Generate response using Gemini
    const response = await getChatResponse(message, documentContext);

    // Log the chat interaction
    await ChatLog.create({
      user: userId,
      document: documentId || null,
      query: message,
      response,
      timestamp: new Date()
    });

    res.status(200).json({ response });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ message: 'Error processing chat message' });
  }
};

/**
 * Get chat history for a user, optionally filtered by document
 */
export const getChatHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized - User not authenticated' });
      return;
    }
    const userId = req.user.id;
    const { documentId } = req.query;

    const query: any = { user: userId };
    
    // If documentId is provided, filter by document
    if (documentId) {
      query.document = documentId;
    }

    const chatHistory = await ChatLog.find(query)
      .sort({ timestamp: -1 })
      .limit(50);

    res.status(200).json(chatHistory);
  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({ message: 'Error fetching chat history' });
  }
};