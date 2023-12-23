import bcrypt from 'bcrypt';
import { Schema, model } from 'mongoose';
import config from '../../config';
import { TUser, UserModel } from './user.interface';
import { UserStatus } from './user.constant';
const userSchema = new Schema<TUser, UserModel>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      select: 0,
    },
    needPasswordChange: {
      type: Boolean,
      default: true,
    },
    passwordChangedAt: {
      type: Date,
    },

    role: {
      type: String,
      enum: ['admin', 'student', 'faculty'],
    },
    status: {
      type: String,
      // enum: ['in-progress', 'blocked'],
      enum: UserStatus,
      default: 'in-progress',
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

userSchema.pre('save', async function (next) {
  //eslint-disable-next-line @typescript-eslint/no-this-alias
  const user = this;
  //hashing password and saved into db
  user.password = await bcrypt.hash(
    user.password,
    Number(config.bcrypt_salt_rounds),
  );
  next();
});
//set empty string
userSchema.post('save', function (doc, next) {
  doc.password = '';
  next();
});

userSchema.statics.isUserExistsByCustomId = async function (id: string) {
  return await User.findOne({ id }).select('+password');
};

userSchema.statics.isPasswordMatched = async function (
  plainTextPassword: string,
  hashedPassword: string,
) {
  return await bcrypt.compare(plainTextPassword, hashedPassword);
};
userSchema.statics.isJWTIssuedBeforePasswordChange = function (
  passwordChangedTimestamp: Date,
  jwtIssuedTimestamp: number,
) {
  // return passwordChangedTimestamp > jwtIssuedTimestamp;
  const passwordChangeTime =
    new Date(passwordChangedTimestamp).getTime() / 1000;
  // console.log(passwordChangeTime, jwtIssuedTimestamp);
  return passwordChangeTime > jwtIssuedTimestamp;
};

export const User = model<TUser, UserModel>('User', userSchema);
