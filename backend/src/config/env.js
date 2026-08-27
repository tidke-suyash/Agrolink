const dotenv = require('dotenv');
dotenv.config();

const requiredVars = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_KEY',
  'SUPABASE_ANON_KEY',
  'GEMINI_API_KEY',
  'OPENWEATHER_API_KEY',
  'RAZORPAY_KEY_ID',
  'RAZORPAY_KEY_SECRET',
];

// Validate all required env vars exist at startup
const missing = requiredVars.filter((key) => !process.env[key]);
if (missing.length > 0 && process.env.NODE_ENV === 'production') {
  console.error(`❌ Missing required environment variables:\n  ${missing.join('\n  ')}`);
  process.exit(1);
}

if (missing.length > 0) {
  console.warn(`⚠️  Missing env vars (dev mode, continuing): ${missing.join(', ')}`);
}

module.exports = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY,
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  OPENWEATHER_API_KEY: process.env.OPENWEATHER_API_KEY,
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
};
