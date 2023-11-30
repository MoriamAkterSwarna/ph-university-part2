/* eslint-disable @typescript-eslint/no-unused-vars */
import httpStatus from 'http-status';
import mongoose from 'mongoose';
import config from '../../config';
import AppError from '../../errors/AppError';
import { AcademicSemester } from '../academicSemester/academicSemester.model';
import { Student } from '../student.model';
import { TStudent } from '../student/student.interface';
import { TUser } from './user.interface';
import { User } from './user.model';
import { generateStudentId } from './user.utils';

const createStudentIntoDB = async (
  password: string,
  //  studentData: TStudent
  payload: TStudent,
) => {
  //create a userData object
  const userData: Partial<TUser> = {};

  //if password is not provided then set default password
  // if (!password) {
  //   userData.password = config.default_password as string;
  // }else{
  //   userData.password = password;
  // }
  // simplified version of above code
  userData.password = password || (config.default_password as string);

  //set student role
  userData.role = 'student';

  // const generateStudentId = (payload: TAcademicSemester) => {};
  //find academic semester info
  const admissionSemester = await AcademicSemester.findById(
    payload.admissionSemester,
  );

  const session = await mongoose.startSession();
  try {
    // start transaction
    session.startTransaction();
    //set manually generated id
    // userData.id = '2030100001';
    // userData.id = admissionSemester ? generateStudentId(admissionSemester) : '';
    userData.id = await generateStudentId(admissionSemester!);

    //create a userData (transaction 1)
    // const newUser = await User.create(userData); // built in static method
    const newUser = await User.create([userData], { session }); // built in static method   // newUser is an array here

    // create a student
    // if (Object.keys(newUser).length) {
    if (!newUser.length) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Failed To create user');
    }
    //set id, _id as a userData
    // payload.id = newUser.id;
    // payload.user = newUser._id; //reference id of user
    payload.id = newUser[0].id;
    payload.user = newUser[0]._id; //reference id of user

    //create a student (transaction 2)
    // const newStudent = await Student.create(payload);
    const newStudent = await Student.create([payload], { session });

    if (!newStudent) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Failed To create a Student');
    }

    await session.commitTransaction();
    await session.endSession();
    return newStudent;
  } catch (err) {
    await session.abortTransaction();
    await session.endSession();
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed To create a Student');
  }

  // return result;
};
export const UserServices = {
  createStudentIntoDB,
};
