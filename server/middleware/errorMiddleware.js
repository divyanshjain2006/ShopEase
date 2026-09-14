const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Mongoose bad ObjectId
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    return res.status(400).json({ message: 'Invalid ID format' });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    return res.status(400).json({ message: 'Duplicate field value entered' });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ message: messages });
  }

  const status = err.statusCode || 500;
  res.status(status).json({
    message: status === 500 ? 'Internal Server Error' : (err.message || 'Internal Server Error'),
  });
};

const notFound = (req, res, next) => {
  res.status(404).json({ message: 'Route not found' });
};

module.exports = { errorHandler, notFound };
