import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

/**
 * Extract text from various file types
 * @param filePath Path to the file
 * @param fileType MIME type of the file
 * @returns Promise resolving to the extracted text
 */
export const extractTextFromFile = async (filePath: string, fileType: string): Promise<string> => {
  try {
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    // Extract text based on file type
    switch (fileType) {
      case 'application/pdf':
        return await extractFromPdf(filePath);
      
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        return await extractFromDocx(filePath);
      
      case 'text/plain':
        return await fs.promises.readFile(filePath, 'utf-8');
      
      default:
        throw new Error(`Unsupported file type: ${fileType}`);
    }
  } catch (error) {
    console.error('Error extracting text:', error);
    throw new Error(`Failed to extract text: ${(error as Error).message}`);
  }
};

/**
 * Extract text from PDF file
 * @param filePath Path to the PDF file
 * @returns Promise resolving to the extracted text
 */
const extractFromPdf = async (filePath: string): Promise<string> => {
  try {
    const dataBuffer = await fs.promises.readFile(filePath);
    const data = await pdfParse(dataBuffer);
    return data.text || '';
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error(`Failed to extract text from PDF: ${(error as Error).message}`);
  }
};

/**
 * Extract text from DOCX file
 * @param filePath Path to the DOCX file
 * @returns Promise resolving to the extracted text
 */
const extractFromDocx = async (filePath: string): Promise<string> => {
  try {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value || '';
  } catch (error) {
    console.error('Error extracting text from DOCX:', error);
    throw new Error(`Failed to extract text from DOCX: ${(error as Error).message}`);
  }
};