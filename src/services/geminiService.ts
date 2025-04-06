import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import config from '../config/config';

console.log('Gemini API Key:', config.GEMINI_API_KEY);
// Initialize the Gemini API with your API key
const genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY);

// Add logging to debug API key issues
console.log('Gemini API Key configured:', config.GEMINI_API_KEY ? 'Yes (length: ' + config.GEMINI_API_KEY.length + ')' : 'No');

/**
 * Generate a summary of the provided text using Gemini
 * @param text The text to summarize
 * @returns A promise that resolves to the generated summary
 */
export const generateSummary = async (text: string): Promise<string> => {
  try {
    if (!config.GEMINI_API_KEY || config.GEMINI_API_KEY.trim() === '') {
      throw new Error('Gemini API key is not configured');
    }
    
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent(text);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.log(error);
    console.error('Error generating summary:', error);
    if (error instanceof Error && error.message.includes('API Key')) {
      throw new Error('Gemini API key configuration error');
    }
    throw new Error('Failed to generate summary');
  }
};

/**
 * Generate questions and answers based on the provided text
 * @param text The text to generate Q&A from
 * @returns A promise resolving to an array of question-answer pairs
 */
export const generateQa = async (text: string): Promise<Array<{question: string, answer: string}>> => {
  try {
    // Get the model
    const model: GenerativeModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    
    // Generate content
    const prompt = `Based on the following text, generate 5 relevant question and answer pairs in JSON format like [{ "question": "...", "answer": "..." }]:

${text}`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();
    
    // Extract JSON from the response
    // This handles cases where the model might include explanatory text before or after the JSON
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Failed to parse JSON from model response');
    }
    
    // Parse the JSON
    const qaArray = JSON.parse(jsonMatch[0]);
    
    // Validate the structure
    if (!Array.isArray(qaArray) || !qaArray.every(item => 
      typeof item === 'object' && 'question' in item && 'answer' in item)) {
      throw new Error('Invalid Q&A format returned from model');
    }
    
    return qaArray;
  } catch (error) {
    console.error('Error generating Q&A:', error);
    throw new Error(`Failed to generate Q&A: ${(error as Error).message}`);
  }
};

/**
 * Generate a quiz based on the provided text
 * @param text The text to generate a quiz from
 * @returns A promise resolving to an array of quiz questions
 */
export const generateQuiz = async (text: string): Promise<Array<{question: string, options: string[], correctAnswer: string}>> => {
  try {
    // Get the model
    const model: GenerativeModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    
    // Generate content
    const prompt = `Based on the following text, generate 3 multiple-choice quiz questions in JSON format like [{ "question": "...", "options": ["...", "...", "..."], "correctAnswer": "..." }]:

${text}`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();
    
    // Extract JSON from the response
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Failed to parse JSON from model response');
    }
    
    // Parse the JSON
    const quizArray = JSON.parse(jsonMatch[0]);
    
    // Validate the structure
    if (!Array.isArray(quizArray) || !quizArray.every(item => 
      typeof item === 'object' && 
      'question' in item && 
      'options' in item && 
      Array.isArray(item.options) &&
      'correctAnswer' in item)) {
      throw new Error('Invalid quiz format returned from model');
    }
    
    return quizArray;
  } catch (error) {
    console.error('Error generating quiz:', error);
    throw new Error(`Failed to generate quiz: ${(error as Error).message}`);
  }
};

/**
 * Get a response from the chat model
 * @param prompt The user's question or prompt
 * @param context Optional context to provide additional information
 * @returns A promise resolving to the chat response
 */
export const getChatResponse = async (prompt: string, context?: string): Promise<string> => {
  try {
    // Get the model
    const model: GenerativeModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    
    // Construct the prompt based on whether context is provided
    let fullPrompt: string;
    if (context) {
      fullPrompt = `Given the following context:

${context}

Answer the question: ${prompt}`;
    } else {
      fullPrompt = `Answer the question: ${prompt}`;
    }
    
    // Generate content
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error getting chat response:', error);
    throw new Error(`Failed to get chat response: ${(error as Error).message}`);
  }
};