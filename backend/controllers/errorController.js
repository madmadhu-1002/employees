const AppError = require('../utils/appError.js');

const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  console.log(value);

  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

const handleCastErrorDB = err => {
    const message = `Invalid ${err.path}: ${err.value}.`;
    return new AppError(message, 400);
  };

const handleJWTError = () =>
    new AppError('Invalid token. Please log in again!', 401);

const sendDevError = (error, res) => {
  res.status(error.statusCode).json({
    status: error.status,
    success: false,
    message: error.message,
    stack: error,
  });
};

const sendProdError = (error, res) => {
  if (error.isOperational) {
    res.status(error.statusCode).json({
      status: error.status,
      success: false,
      message: error.message,
    });
  } else {
    res.status(500).json({
      status: 'error',
      success: false,
      message: 'Something went wrong',
    });
  }
};

module.exports = (err, req, res, next) => {
  console.log(err);
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendDevError(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    if (err.code === 11000) err = handleDuplicateFieldsDB(err);
    if (err.name === 'CastError') err = handleCastErrorDB(err);
    if (err.name === 'JsonWebTokenError') err = handleJWTError();
    sendProdError(err, res);
  }
};
