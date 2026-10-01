import { apiError } from '../utils/apiError.js';

const errorHandler = (err, req, res, next) => {
  let error = err;

  // If error is not an instance of our custom ApiError, wrap it
  if (!(error instanceof apiError)) {
    const statusCode = error.statusCode || 500;
    const message = error.message || "Something went wrong";
    error = new apiError(statusCode, message, [], err.stack);
  }

  const response = {
    success: false,
    message: error.message,
    errors: error.errors,
  };

  return res.status(error.statusCode).json(response);
};

export { errorHandler };