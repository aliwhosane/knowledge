import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Define configuration object with all environment variables
const config = {
  // Server configuration
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  
  // MongoDB configuration
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/ai-teacher',
  
  // JWT configuration
  JWT_SECRET: process.env.JWT_SECRET || 'fallback_secret',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '30d',
  
  // API Keys
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  
  // File upload configuration
  UPLOAD_PATH: process.env.UPLOAD_PATH || 'uploads/',
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10), // 5MB
};

// Validate required environment variables in production
if (config.NODE_ENV === 'production') {
  const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET', 'GEMINI_API_KEY'];
  
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Environment variable ${envVar} is required in production mode`);
    }
  }
}

export default config;