/* eslint-disable @typescript-eslint/no-unused-vars */
import bcrypt from 'bcrypt';
import httpStatus from 'http-status';
import jwt, { JwtPayload } from 'jsonwebtoken';
import config from '../../config';
import AppError from '../../errors/AppError';
import { sendEmail } from '../../utils/sendEmail';
import { User } from '../user/user.model';
import { TLoginUser } from './auth.interface';
import { createToken, verifyToken } from './auth.utils';

const loginUserDB = async (payload: TLoginUser) => {
  console.log(payload);

  const user = await User.isUserExistsByCustomId(payload?.id);
  //   console.log(user);

  //checking if the user is exist
  //   const isUserExists = await User.findOne({ id: payload?.id });
  //   console.log(isUserExists);
  //   if (!isUserExists) {
  //     throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  //   }

  //   if (!(await User.isUserExistsByCustomId(payload?.id))) {
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  //   //checking if the user is deleted
  // const isDeleted = isUserExists?.isDeleted;
  const isDeleted = user?.isDeleted;
  // console.log(isDeleted);
  if (isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, 'User is already deleted');
  }

  //   //checking if the user is blocked
  //   const userStatus = isUserExists?.status;
  const userStatus = user?.status;
  //   console.log(userStatus);
  if (userStatus === 'blocked') {
    throw new AppError(httpStatus.FORBIDDEN, 'User is already blocked');
  }

  //   //checking if the password is correct
  //   const isPasswordMatched = await bcrypt.compare(
  //     payload?.password,
  //     isUserExists?.password,
  //   );
  //   console.log(isPasswordMatched);
  if (!(await User.isPasswordMatched(payload?.password, user?.password))) {
    throw new AppError(httpStatus.FORBIDDEN, 'Password do not matched');
  }

  //access granted: sent access token, refresh token

  // payload
  const jwtPayload = {
    userId: user.id,
    role: user.role,
  };

  //create token and sent to the client
  // const accessToken = jwt.sign(jwtPayload, config.jwt_access_secret as string, {
  //   expiresIn: '10d',
  // });
  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expiration_in as string,
  );
  const refreshToken = createToken(
    jwtPayload,
    config.jwt_refresh_secret as string,
    config.jwt_refresh_expiration_in as string,
  );
  // const refreshToken = jwt.sign(
  //   jwtPayload,
  //   config.jwt_refresh_secret as string,
  //   {
  //     expiresIn: '10d',
  //   },
  // );

  return {
    accessToken,
    refreshToken,
    needPasswordChange: user?.needPasswordChange,
  };
};
const changePasswordDB = async (
  userData: JwtPayload,
  payload: {
    oldPassword: string;
    newPassword: string;
  },
) => {
  const user = await User.isUserExistsByCustomId(userData.userId);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const isDeleted = user?.isDeleted;
  if (isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, 'User is already deleted');
  }

  const userStatus = user?.status;
  if (userStatus === 'blocked') {
    throw new AppError(httpStatus.FORBIDDEN, 'User is already blocked');
  }

  if (!(await User.isPasswordMatched(payload?.oldPassword, user?.password))) {
    throw new AppError(httpStatus.FORBIDDEN, 'Password do not matched');
  }

  //hash new password
  const newHashedPassword = await bcrypt.hash(
    payload?.newPassword,
    Number(config.bcrypt_salt_rounds),
  );

  await User.findOneAndUpdate(
    {
      id: userData.userId,
      role: userData.role,
    },
    {
      password: newHashedPassword,
      needPasswordChange: false,
      passwordChangedAt: new Date(),
    },
  );
  return null;
};
const refreshTokenService = async (token: string) => {
  //checking if the given token is valid

  // const decoded = jwt.verify(
  //   token,
  //   config.jwt_refresh_secret as string,
  // ) as JwtPayload;
  const decoded = verifyToken(token, config.jwt_refresh_secret as string);

  const { userId, iat } = decoded;

  const user = await User.isUserExistsByCustomId(userId);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const isDeleted = user?.isDeleted;
  if (isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, 'User is already deleted');
  }

  const userStatus = user?.status;
  if (userStatus === 'blocked') {
    throw new AppError(httpStatus.FORBIDDEN, 'User is already blocked');
  }
  if (
    user.passwordChangedAt &&
    User.isJWTIssuedBeforePasswordChange(user.passwordChangedAt, iat as number)
  ) {
    throw new AppError(httpStatus.FORBIDDEN, 'You are not Authorized');
  }
  const jwtPayload = {
    userId: user.id,
    role: user.role,
  };
  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expiration_in as string,
  );
  return {
    accessToken,
  };
};
const forgetPasswordAuth = async (userId: string) => {
  const user = await User.isUserExistsByCustomId(userId);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const isDeleted = user?.isDeleted;
  if (isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, 'User is already deleted');
  }

  const userStatus = user?.status;
  if (userStatus === 'blocked') {
    throw new AppError(httpStatus.FORBIDDEN, 'User is already blocked');
  }
  const jwtPayload = {
    userId: user.id,
    role: user.role,
  };
  const resetToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    '10m',
  );
  const resetUILink = `${config.reset_pass_ui_link}?${user.id}&token=${resetToken}`;

  sendEmail(user.email, resetUILink);
  // console.log(resetUILink);
  console.log(resetToken);
};

const resetPasswordAuth = async (
  payload: { id: string; newPassword: string },
  token: string,
) => {
  const user = await User.isUserExistsByCustomId(payload?.id);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const isDeleted = user?.isDeleted;
  if (isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, 'User is already deleted');
  }

  const userStatus = user?.status;
  if (userStatus === 'blocked') {
    throw new AppError(httpStatus.FORBIDDEN, 'User is already blocked');
  }

  // const decoded = jwt.verify(
  //   token,
  //   config.jwt_access_secret as string,
  // ) as JwtPayload;
  const decoded = verifyToken(token, config.jwt_access_secret as string);

  console.log(decoded);
  if (payload?.id !== decoded.userId) {
    throw new AppError(httpStatus.FORBIDDEN, 'You are not Authorized');
  }
  const newHashedPassword = await bcrypt.hash(
    payload?.newPassword,
    Number(config.bcrypt_salt_rounds),
  );
  await User.findOneAndUpdate(
    {
      id: decoded.userId,
      role: decoded.role,
    },
    {
      password: newHashedPassword,
      needPasswordChange: false,
      passwordChangedAt: new Date(),
    },
  );
  // return null;
};

export const AuthServices = {
  loginUserDB,
  changePasswordDB,
  refreshTokenService,
  forgetPasswordAuth,
  resetPasswordAuth,
};
