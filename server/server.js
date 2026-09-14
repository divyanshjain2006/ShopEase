const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');

const { errorHandler, notFound } = require('./middleware/errorMiddleware');
require('dotenv').config();

const connectDB = require('./config/db');

const app = express();

// SEC-012: Security headers
app.use(helmet());

// Allow frontend origin explicitly for cookies/headers if needed
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);

// SEC-023: Explicit body size limit
app.use(express.json({ limit: '100kb' }));
app.use(cookieParser());

// SEC-010: Rate limiting — stricter on auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 requests per window
  message: { message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/products', generalLimiter, productRoutes);
app.use('/api/orders', generalLimiter, orderRoutes);


// Health
app.get('/api/health', (req, res) => {
  res.json({ message: 'Ethnic Threads API is running' });
});

// Error handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.BACKEND_PORT || 5001;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
