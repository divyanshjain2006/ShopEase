const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');

const { errorHandler, notFound } = require('./middleware/errorMiddleware');
require('dotenv').config();

const connectDB = require('./config/db');

const app = express();

// Allow frontend origin explicitly for cookies/headers if needed
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);


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
