import { Request, Response } from 'express';
import SearchLog from '../models/SearchLog';
import DocumentModel from '../models/Document';

// @desc    Log a search query
// @route   POST /api/log/search
// @access  Private
export const logSearch = async (req: Request, res: Response) => {
  try {
    const { query, documentContext } = req.body;

    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    // Default foundResults to false
    let foundResults = false;

    // If documentContext is provided, verify it exists and belongs to the user
    if (documentContext) {
      const document = await DocumentModel.findOne({ 
        _id: documentContext, 
        user: (req as any).user._id 
      });
      
      // If document exists and belongs to the user, assume results were found
      foundResults = !!document;
    }

    // Create a new search log entry
    const searchLog = await SearchLog.create({
      user: (req as any).user._id,
      query,
      timestamp: new Date(),
      documentContext: documentContext || undefined,
      foundResults
    });

    res.status(201).json({
      success: true,
      data: searchLog
    });
  } catch (error) {
    console.error('Search log error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};