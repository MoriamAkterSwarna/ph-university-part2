import mongoose from 'mongoose';
import { TGenericErrorResponse } from '../interface/error';
import { TErrorSource } from './../interface/error';

const handleCastError = (
  err: mongoose.Error.CastError,
): TGenericErrorResponse => {
  const errorSources: TErrorSource = [
    {
      path: err.path,
      message: err.message,
    },
  ];

  const statusCode = 400;
  return {
    statusCode,
    message: 'Invalid ID',
    errorSources,
  };
};
export default handleCastError;
