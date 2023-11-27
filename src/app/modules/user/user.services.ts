import config from '../../config';
import { Student } from '../student.model';
import { TStudent } from '../student/student.interface';
import { TUser } from './user.interface';
import { User } from './user.model';

const createStudentIntoDB = async (password: string, studentData: TStudent) => {
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

  //set manually generated id
  userData.id = '2030100001';

  //create a userData
  const newUser = await User.create(userData); // built in static method

  // create a student
  if (Object.keys(newUser).length) {
    //set id, _id as a userData
    studentData.id = newUser.id;
    studentData.user = newUser._id; //reference id of user

    const newStudent = await Student.create(studentData);

    return newStudent;
  }

  // return result;
};
export const UserServices = {
  createStudentIntoDB,
};
