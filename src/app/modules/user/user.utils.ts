/* eslint-disable @typescript-eslint/no-unused-vars */
import { TAcademicSemester } from '../academicSemester/academicSemester.interface';
import { User } from './user.model';

const findLastStudentId = async () => {
  const lastStudent = await User.findOne({ role: 'student' }, { id: 1, _id: 0 })
    .sort({ createdAt: -1 })
    .lean();

  return lastStudent?.id ? lastStudent.id : undefined;
};
export const generateStudentId = async (payload: TAcademicSemester) => {
  // console.log(await findLastStudentId());

  //first time 0000
  // 0001 => 1
  let currentId = (0).toString(); // 0000 by default
  // const currentId = (await findLastStudentId()) || (0).toString();

  // if (await findLastStudentId()) {
  //   const latStudentId = await findLastStudentId();
  // }

  //in the above if condition we have to called the findLastStudentId() function twice thats why we have used the below code
  const lastStudentId = await findLastStudentId();

  const lastStudentSemesterCode = lastStudentId?.substring(4, 6); // 01
  const lastStudentYear = lastStudentId?.substring(0, 4); //2030

  const currentSemesterCode = payload.code; // 01
  const currentYear = payload.year; // 2030
  if (
    lastStudentId &&
    lastStudentSemesterCode === currentSemesterCode &&
    lastStudentYear === currentYear
  ) {
    currentId = lastStudentId.substring(6, 10); // 0001
  }

  let incrementId = (Number(currentId) + 1).toString().padStart(4, '0');
  incrementId = `${payload.year}${payload.code}${incrementId}`;
  return incrementId;
};
