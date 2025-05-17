require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const errorHandler = require('./middleware/error');
const path = require('path');
const fs = require('fs');
const authRoutes = require('./routes/authRoutes');
const sendEmail = require('./services/emailService');
const { checkExpiredSubscriptions } = require('./services/subscriptionService');
const healthRoutes = require('./routes/healthRoutes');
const multer = require('multer');
const APIError = require('./utils/APIError');

// Initialize express app
const app = express();

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(cookieParser());

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

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'public/uploads');
if (!fs.existsSync(uploadsDir)){
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // Limit file size to 5MB
});

// Serve static files with proper headers and CORS
app.use('/uploads', (req, res, next) => {
  const filePath = path.join(__dirname, 'public/uploads', req.path);
  
  // Check if file exists
  if (fs.existsSync(filePath)) {
    // Set appropriate content type based on file extension
    const ext = path.extname(filePath).toLowerCase();
    const contentType = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif'
    }[ext] || 'application/octet-stream';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Access-Control-Allow-Origin', '*'); // Allow all origins for images
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
    next();
  } else {
    console.log('Image not found at path:', filePath); // Debug log
    // Serve default avatar if image not found
    const defaultAvatarPath = path.join(__dirname, 'public', 'default-avatar.png');
    if (fs.existsSync(defaultAvatarPath)) {
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.sendFile(defaultAvatarPath);
    } else {
      res.status(404).json({
        status: 'error',
        message: 'Image not found'
      });
    }
  }
}, express.static(path.join(__dirname, 'public/uploads'), {
  setHeaders: (res, path) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));

// Create receipts directory if it doesn't exist
const receiptDir = path.join(__dirname, 'public/receipts');
if (!fs.existsSync(receiptDir)) {
  fs.mkdirSync(receiptDir, { recursive: true });
}

// Serve receipt files with proper headers
app.use('/receipts', (req, res, next) => {
  const filePath = path.join(__dirname, 'public/receipts', req.path);
  
  // Check if file exists
  if (fs.existsSync(filePath)) {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${path.basename(filePath)}"`);
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin || 'https://gym91514.netlify.app');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    next();
  } else {
    res.status(404).json({
      status: 'error',
      message: 'Receipt not found'
    });
  }
}, express.static(path.join(__dirname, 'public/receipts')));

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
  res.header('Access-Control-Allow-Origin', 'https://gym91514.netlify.app');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '86400');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  next();
});

// Database connection
connectDB();

// Mount routes - ensure the path is a simple string
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/health', healthRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Internal server error'
  });
});

// 404 handler - use a simple string path
app.use('/404', (req, res) => {
  res.status(404).json({
    status: 'fail',
    message: 'Route not found'
  });
});

// Catch-all route handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.originalUrl} not found`
  });
});

// Check subscriptions every day at midnight
const scheduleSubscriptionCheck = () => {
  const now = new Date();
  const night = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1, // tomorrow
    0, 0, 0 // midnight
  );
  const timeToMidnight = night.getTime() - now.getTime();

  setTimeout(() => {
    checkExpiredSubscriptions();
    // Run every 24 hours
    setInterval(checkExpiredSubscriptions, 24 * 60 * 60 * 1000);
  }, timeToMidnight);
};

scheduleSubscriptionCheck();

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Make multer upload middleware available (optional, but good for clarity)
app.locals.upload = upload;

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION!');
  console.log(err.name, err.message);
  process.exit(1);
});