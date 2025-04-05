import { Request, Response } from 'express';
import { getChatResponse } from '../services/geminiService';
import { extractTextFromFile } from '../services/textExtractorService';
import DocumentModel from '../models/Document';

// @desc    Get AI chat response
// @route   POST /api/ai/chat
// @access  Private
export const getAiChatResponse = async (req: Request, res: Response) => {
  try {
    const { prompt, documentId } = req.body;

    if (!prompt) {
      return res.status(400).json({ message: 'Prompt is required' });
    }

    let context: string | undefined;

    // If documentId is provided, fetch the document and extract text
    if (documentId) {
      // Verify document ownership
      const document = await DocumentModel.findOne({ _id: documentId, user: (req as any).user._id });
      
      if (!document) {
        return res.status(404).json({ message: 'Document not found or not authorized' });
      }

      // Extract text from the document to use as context
      try {
        context = await extractTextFromFile(document.storagePath, document.fileType);
      } catch (error) {
        console.error('Text extraction error:', error);
        return res.status(500).json({ message: 'Failed to extract text from document' });
      }
    }

    // Get response from Gemini
    const response = await getChatResponse(prompt, context);
    
    // Return the response
    res.json({ response });
  } catch (error) {
    console.error('AI chat error:', error);
    res.status(500).json({ message: `Chat failed: ${(error as Error).message}` });
  }
};