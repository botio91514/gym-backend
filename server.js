// CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:5173', 
    'http://localhost:3000', 
    'https://gym91514.netlify.app',
    'https://backend-3xq0.onrender.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 600
};

app.use(cors(corsOptions));

// Add cookie-parser middleware
app.use(cookieParser());

// Add headers for all responses
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && [
    'http://localhost:5173', 
    'http://localhost:3000', 
    'https://gym91514.netlify.app',
    'https://backend-3xq0.onrender.com'
  ].includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
}); 