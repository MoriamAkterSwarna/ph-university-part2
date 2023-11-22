import bcrypt from 'bcrypt';
import { Schema, model } from 'mongoose';
import validator from 'validator';
import config from '../config';
import {
  StudentModel,
  // StudentMethod,
  TGuardian,
  TLocalGuardian,
  TStudent,
  TUserName,
} from './student/student.interface';

const userNameSchema = new Schema<TUserName>({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true, //it will trim before and after space of the field
    maxlength: [20, 'First name can not be more than 20 characters'],

    //custom validation
    validate: {
      validator: function (value: string) {
        const firstNameStr = value.charAt(0).toUpperCase() + value.slice(1);
        // if (value !== firstNameStr) {
        //   return false;
        // }
        // return true;
        return firstNameStr === value;
      },
      message: '{VALUE} is not in capitalize format.',
    },
  },
  middleName: { type: String },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],

    //validator package
    validate: {
      validator: (value: string) => validator.isAlpha(value),
      message: '{VALUE} is not valid',
    },
  },
});
const guardianSchema = new Schema<TGuardian>({
  fatherName: {
    type: String,
    required: true,
  },
  fatherOccupation: {
    type: String,
    required: true,
  },
  fatherContactNo: {
    type: String,
    required: true,
  },
  motherName: {
    type: String,
    required: true,
  },
  motherOccupation: {
    type: String,
    required: true,
  },
  motherContactNo: {
    type: String,
    required: true,
  },
});
const localGuardianSchema = new Schema<TLocalGuardian>({
  name: { type: String, required: true },
  occupation: { type: String, required: true },
  contactNo: { type: String, required: true },
  address: { type: String, required: true },
});

//for custom instance
// const studentSchema = new Schema<TStudent, StudentModel, StudentMethod>({

//for custom static method
const studentSchema = new Schema<TStudent, StudentModel>(
  {
    id: { type: String, required: true, unique: true },
    password: {
      type: String,
      required: [true, 'password is required'],
      maxlength: [20, 'pass can not be more than 20 character'],
    },
    name: { type: userNameSchema, required: true },
    //   gender: ['male', 'female'],
    gender: {
      type: String,
      enum: {
        values: ['male', 'female'],
        // message: // "The Gender field can only be one of the following 'male', or 'female'",
        message: '{VALUE} is not valid', // it will show the given value.
      },
      required: true,
    },
    dateOfBirth: { type: String },
    email: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: (value: string) => validator.isEmail(value),
        message: '{VALUE} is not a valid Email.',
      },
    },
    contactNo: { type: String, required: true },
    emergencyContactNo: { type: String, required: true },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'],
    },

    presentAddress: { type: String, required: true },
    permanentAddress: { type: String, required: true },
    guardian: { type: guardianSchema, required: true },
    localGuardian: { type: localGuardianSchema, required: true },
    profileImg: { type: String },
    isActive: {
      type: String,
      enum: ['active', 'blocked'],
      default: 'active',
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },

  //activate virtual
  {
    toJSON: {
      virtuals: true,
    },
  },
);

//virtual
studentSchema.virtual('fullName').get(function () {
  return ` ${this.name.firstName} + ${this.name.middleName} + ${this.name.lastName}`;
});

//pre save middleware/hooks => will work on create function save ()
studentSchema.pre('save', async function (next) {
  // console.log(this, 'pre hook: we will save the data');

  //eslint-disable-next-line @typescript-eslint/no-this-alias
  const user = this;
  //hashing password and saved into db
  user.password = await bcrypt.hash(
    user.password,
    Number(config.bcrypt_salt_rounds),
  );
  next();
});
//post save middleware hooks
studentSchema.post('save', function (doc, next) {
  doc.password = '';
  // console.log(this, 'post hook: we will save the data');
  next();
});

//creating a custom instance method
// studentSchema.methods.isUserExists = async function (id: string) {
//   const existingUser = await Student.findOne({ id });
//   return existingUser;
// };

//Query Middleware
studentSchema.pre('find', function (next) {
  // console.log(this);
  this.find({ isDeleted: { $ne: true } });
  next();
});
studentSchema.pre('findOne', function (next) {
  // console.log(this);
  this.find({ isDeleted: { $ne: true } });
  next();
});
studentSchema.pre('aggregate', function (next) {
  // console.log(this);
  this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
  next();
});

//creating a custom static method
studentSchema.statics.isUserExists = async function (id: string) {
  const existingUser = await Student.findOne({ id });
  return existingUser;
};

//create a model
export const Student = model<TStudent, StudentModel>('Student', studentSchema);
