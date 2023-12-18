import httpStatus from 'http-status';
import mongoose from 'mongoose';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../errors/AppError';
import { Student } from '../student.model';
import { User } from '../user/user.model';
import { studentSearchableFields } from './student.constant';
import { TStudent } from './student.interface';
// import { TStudent } from './student.interface';

// const createStudentIntoDB = async (studentData: TStudent) => {
//   // using static method
//   if (await Student.isUserExists(studentData.id)) {
//     throw new Error('user already exists');
//   }

//   const result = await Student.create(studentData); // built in static method

//   // const student = new Student(studentData); // create an instance

//   // using custom instance
//   // if (await student.isUserExists(studentData.id)) {
//   //   throw new Error('user already exists');
//   // }
//   // const result = await student.save(); // built in instance method

//   return result;
// };

const getAllStudentsFromDB = async (query: Record<string, unknown>) => {
  // console.log('base query', query);
  // const queryObj = { ...query };
  //{email: {$reges: query.searTerm, $options: i}}
  //{presentAddress: {$reges: query.searTerm, $options: i}}
  //{'name.firstName': {$reges: query.searTerm, $options: i}}
  // const studentSearchableFields = [
  //   'email',
  //   'presentAddress',
  //   'name.firstName',
  //   'name.middleName',
  // ];
  // let searchTerm = '';
  // if (query.searchTerm) {
  //   searchTerm = query?.searchTerm as string;
  // }
  // const searchQuery = Student.find({
  //   $or: studentSearchableFields.map(field => ({
  //     [field]: { $regex: searchTerm, $options: 'i' },
  //   })),
  // });
  //filtering
  // const excludeFields = [
  //   'searchTerm',
  //   'sort',
  //   'limit',
  //   'skip',
  //   'page',
  //   'fields',
  // ];
  // excludeFields.forEach(elm => delete queryObj[elm]);
  // console.log({ query }, { queryObj });
  // const result = await Student.find()
  // const result = await Student.find({
  //   $or: studentSearchableFields.map(field => ({
  //     [field]: { $regex: searchTerm, $options: 'i' },
  //   })),
  // });
  // $or: ['email', 'presentAddress', 'name.firstName', 'name.middleName'].map(
  // .populate('admissionSemester')
  // .populate({
  //   path: 'academicDepartment',
  //   populate: { path: 'academicFaculty' },
  // });
  // const filterQuery = searchQuery
  //   // .find(query)
  //   .find(queryObj)
  //   .populate('admissionSemester')
  //   .populate({
  //     path: 'academicDepartment',
  //     populate: { path: 'academicFaculty' },
  //   });
  //sorting
  // let sorted = 'createdAt';
  // if (query.sort) {
  //   sorted = query.sort as string;
  // }
  // // const sortQuery = await filterQuery.sort(sorted);
  // const sortQuery = filterQuery.sort(sorted);
  //paginate
  // let page = 1;
  // let limit = 1;
  // let skip = 0;
  // if (query.limit) {
  //   limit = Number(query.limit);
  // }
  // if (query.page) {
  //   page = Number(query.page);
  //   skip = (page - 1) * limit;
  // }
  // const paginateQuery = sortQuery.skip(skip);
  //limit
  // if (query.limit) {
  //   limit = Number(query.limit) as number;
  // }
  // const limitQuery = await sortQuery.limit(limit);
  // const limitQuery = paginateQuery.limit(limit);
  //field limiting
  // let fields = '- __v';
  // fields: 'name, email' => fields: 'name email'
  // if (query.fields) {
  //   fields = (query.fields as string).split(',').join(' ');
  //   console.log(fields);
  // }
  // const fieldQuery = await limitQuery.select(fields);
  // return filterQuery;
  // return sortQuery;
  // return limitQuery;
  // return fieldQuery;

  const studentQuery = new QueryBuilder(
    Student.find()
      .populate('user')
      .populate('admissionSemester')
      .populate({
        path: 'academicDepartment',
        populate: { path: 'academicFaculty' },
      }),
    query,
  )
    .search(studentSearchableFields)
    .filter()
    .sort()
    .paginate()
    .fields().modelQuery;

  const result = await studentQuery;
  return result;
};

const getSingleStudentsFromDB = async (id: string) => {
  // const result = await Student.findOne({ id }) //using custom  generated id
  const result = await Student.findById({ id }) //using mongodb _id
    .populate('admissionSemester')
    .populate({
      path: 'academicDepartment',
      populate: { path: 'academicFaculty' },
    });
  // const result = await Student.aggregate([{ $match: { id: id } }]);
  return result;
};

const deleteStudentFromDB = async (id: string) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    //  const result = await Student.updateOne({ id }, { isDeleted: true });
    // const deletedStudent = await Student.findOneAndUpdate(  //using custom generated id
    const deletedStudent = await Student.findByIdAndUpdate(
      //using mongodb _id
      { id },
      { isDeleted: true },
      { new: true, session },
    );

    if (!deletedStudent) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Failed to delete student');
    }

    // get user _id from deletedStudent
    const userId = deletedStudent.user;

    // const deleteUser = await User.findOneAndUpdate( //using custom generated id
    const deleteUser = await User.findByIdAndUpdate(
      //using mongodb _id
      // { id }, //using custom generated id
      userId, //using mongodb _id
      { isDeleted: true },
      { new: true, session },
    );
    if (!deleteUser) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Failed to delete user');
    }
    await session.commitTransaction();
    await session.endSession();
    return deletedStudent;
  } catch (err) {
    await session.abortTransaction();
    await session.endSession();
    throw new Error('Failed to delete student');
  }
};
const updateStudentFromDB = async (id: string, payload: Partial<TStudent>) => {
  const { name, guardian, localGuardian, ...remainingStudentData } = payload;

  const modifiedUpdatedData: Record<string, unknown> = {
    ...remainingStudentData,
  };

  /**
   * guardian{
   * fatherName: 'abc',
   * fatherOccupation: 'xyz',
   * }
   * guardian.fatherOccupation= PQR
   * 
   name.firstName='Mariam'
   name.lastName='Khan'
   */

  if (name && Object.keys(name).length) {
    for (const [key, value] of Object.entries(name)) {
      modifiedUpdatedData[`name.${key}`] = value;
    }
  }
  if (guardian && Object.keys(guardian).length) {
    for (const [key, value] of Object.entries(guardian)) {
      modifiedUpdatedData[`guardian.${key}`] = value;
    }
  }
  if (localGuardian && Object.keys(localGuardian).length) {
    for (const [key, value] of Object.entries(localGuardian)) {
      modifiedUpdatedData[`localGuardian.${key}`] = value;
    }
  }
  console.log(modifiedUpdatedData);

  // const result = await Student.findOneAndUpdate({ id }, payload, { new: true });

  // const result = await Student.findOneAndUpdate({ id }, modifiedUpdatedData, {  //using custom generated id
  const result = await Student.findByIdAndUpdate({ id }, modifiedUpdatedData, {
    //using mongodb _id
    new: true,
    runValidators: true,
  });

  return result;
};

export const StudentServices = {
  // createStudentIntoDB,
  getAllStudentsFromDB,
  getSingleStudentsFromDB,
  deleteStudentFromDB,
  updateStudentFromDB,
};
