/* eslint-disable @typescript-eslint/no-unused-vars */
import config from '../../config';
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

  //set manually generated id
  // userData.id = '2030100001';
  // userData.id = admissionSemester ? generateStudentId(admissionSemester) : '';
  userData.id = await generateStudentId(admissionSemester!);

  //create a userData
  const newUser = await User.create(userData); // built in static method

  // create a student
  if (Object.keys(newUser).length) {
    //set id, _id as a userData
    payload.id = newUser.id;
    payload.user = newUser._id; //reference id of user

    const newStudent = await Student.create(payload);

    return newStudent;
  }

  // return result;
};
export const UserServices = {
  createStudentIntoDB,
};
