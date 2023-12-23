import httpStatus from 'http-status';
import config from '../../config';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { AuthServices } from './auth.services';

const loginUser = catchAsync(async (req, res) => {
  const result = await AuthServices.loginUserDB(req.body);
  const { refreshToken, accessToken, needPasswordChange } = result;
  res.cookie('refreshToken', refreshToken, {
    secure: config.node_env === 'production',
    httpOnly: true,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'user logged in successfully!',
    data: {
      accessToken,
      needPasswordChange,
    },
  });
});
const changePassword = catchAsync(async (req, res) => {
  console.log(req.user, req.body);
  const { ...passwordData } = req.body;
  const result = await AuthServices.changePasswordDB(req.user, passwordData);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Password is updated successfully!',
    data: result,
  });
});
const refreshTokenController = catchAsync(async (req, res) => {
  const { refreshToken } = req.cookies;
  const result = await AuthServices.refreshTokenService(refreshToken);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Access token is retrieved successfully!',
    data: result,
  });
});

const forgotPassword = catchAsync(async (req, res) => {
  const userId = req.body.id;
  const result = await AuthServices.forgetPasswordAuth(userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Password reset link is generated successfully!',
    data: result,
  });
});

const resetPassword = catchAsync(async (req, res) => {
  const token = req.headers.authorization;
  const result = await AuthServices.resetPasswordAuth(req.body, token);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Password is reset successfully!',
    data: result,
  });
});
export const AuthControllers = {
  loginUser,
  changePassword,
  refreshTokenController,
  forgotPassword,
  resetPassword,
};

// http://localhost:3000?A-0001&token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJBLTAwMDEiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3MDMyMjAwMzgsImV4cCI6MTcwMzIyMDYzOH0.o6rThijPHl2vD2APuqY3I5OS_duLI2iRBo3LD_6Vq-Q
