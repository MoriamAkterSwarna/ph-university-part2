/* eslint-disable @typescript-eslint/no-explicit-any */

import { TErrorSource, TGenericErrorResponse } from './../interface/error';

const handleDuplicateError = (error: any): TGenericErrorResponse => {
  const match = error.message.match(/"([^"]*)"/);

  const extractedMessage = match && match[1];
  const errorSources: TErrorSource = [
    {
      path: '',
      message: `${extractedMessage} is already taken`,
    },
  ];
  const statusCode = 400;
  return {
    statusCode,
    message: 'Duplicate Error',
    errorSources,
  };
};
export default handleDuplicateError;
