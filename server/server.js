const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
require('dotenv').config();

const connectDB = require('./config/db');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.get('/api/health', (req, res) => {
  res.json({
    message: 'ShopEase API is running',
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();