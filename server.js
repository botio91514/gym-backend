const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const app = express();

// CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://gym91514.netlify.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  exposedHeaders: ['Set-Cookie'],
  maxAge: 86400
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Add cookie-parser middleware
app.use(cookieParser());

// Configure server timeouts
app.use((req, res, next) => {
  // Increase timeout to 60 seconds
  req.setTimeout(60000);
  res.setTimeout(60000);

  // Handle request timeout
  req.on('timeout', () => {
    console.error('Request has timed out');
    res.status(408).json({ 
      status: 'error',
      message: 'Request timeout' 
    });
  });

  // Handle response timeout
  res.on('timeout', () => {
    console.error('Response has timed out');
    res.status(503).json({ 
      status: 'error',
      message: 'Service temporarily unavailable' 
    });
  });

  next();
});

// Add headers for all responses
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://gym91514.netlify.app'); // Only allow the frontend URL
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '86400'); // 24 hours

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  next();
}); 