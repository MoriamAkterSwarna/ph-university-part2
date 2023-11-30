/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { academicSemesterNameCodeMapper } from './academicSemester.constant';
import { TAcademicSemester } from './academicSemester.interface';
import { AcademicSemester } from './academicSemester.model';

const createAcademicSemesterIntoDB = async (payload: TAcademicSemester) => {
  // this is a type of typescript so i have used it in interface file
  // //semester name ---> semester code
  // type TAcademicSemesterNameCodeMapper = {
  //   // Autumn: '01';
  //   // Summer: '02';
  //   // Fall: '03';

  //   //map type
  //   [key: string]: string;
  // };

  //it is a constant so I have used it in constant file
  // const academicSemesterNameCodeMapper: TAcademicSemesterNameCodeMapper = {
  //   Autumn: '01',
  //   Summer: '02',
  //   Fall: '03',
  // };

  //check if semester name is valid or not
  // academicSemesterNameCodeMapper['Fall] ---> '01'
  if (academicSemesterNameCodeMapper[payload.name] !== payload.code) {
    throw new Error('Invalid Semester Code');
  }
  const academicSemester = await AcademicSemester.create(payload);
  return academicSemester;
};

const getAllAcademicSemestersFromDB = async () => {
  const result = await AcademicSemester.find();
  return result;
};

const getSingleAcademicSemesterFromDB = async (id: string) => {
  const result = await AcademicSemester.findById(id);
  return result;
};

const updateAcademicSemesterIntoDB = async (
  id: string,
  payload: Partial<TAcademicSemester>,
) => {
  if (
    payload.name &&
    payload.code &&
    academicSemesterNameCodeMapper[payload.name] !== payload.code
  ) {
    throw new Error('Invalid Semester Code');
  }

  const result = await AcademicSemester.findOneAndUpdate({ _id: id }, payload, {
    new: true,
  });
  return result;
};

export const AcademicSemesterServices = {
  createAcademicSemesterIntoDB,
  getAllAcademicSemestersFromDB,
  getSingleAcademicSemesterFromDB,
  updateAcademicSemesterIntoDB,
};
