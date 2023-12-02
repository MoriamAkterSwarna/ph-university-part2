/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import config from '../config';
import handleValidationError from '../errors/handleValidationError';
import handleZodError from '../errors/handleZodError';
import { TErrorSource } from '../interface/error';

const globalErrorHandler: ErrorRequestHandler = (error, req, res, next) => {
  let statusCode = error.statusCode || 500;
  let message = error.message || 'something went wrong';

  let errorSources: TErrorSource = [
    {
      path: '',
      message: 'Something went wrong',
    },
  ];

  if (error instanceof ZodError) {
    const simplifiedError = handleZodError(error);
    console.log(simplifiedError);
    statusCode = simplifiedError?.statusCode;
    message = simplifiedError?.message;
    errorSources = simplifiedError?.errorSources;
    // message = 'This is Zod error';
  } else if (error?.name === 'ValidationError') {
    // console.log('Mongoose Error');
    const simplifiedError = handleValidationError(error);
    statusCode = simplifiedError?.statusCode;
    message = simplifiedError?.message;
    errorSources = simplifiedError?.errorSources;
  }

  return res.status(statusCode).json({
    success: false,
    message,
    // error: error,
    errorSources,
    stack: config.node_env === 'development' ? error?.stack : null,
  });
};
export default globalErrorHandler;

/**
 * ===========pattern========
 *
 * success
 * message
 * errorSources:[
 * path: ' '
 * message: ' '
 * ]
 * stack
 */
