/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../errors/AppError';
import { AcademicSemester } from '../academicSemester/academicSemester.model';
import { RegistrationStatus } from './semesterRegistration.constant';
import { TSemesterRegistration } from './semesterRegistration.interface';
import { SemesterRegistration } from './semesterRegistration.model';
import { OfferedCourse } from '../OfferedCourse/OfferedCourse.model';
import mongoose from 'mongoose';

const createSemesterRegistrationIntoDB = async (
  payload: TSemesterRegistration,
) => {
  const academicSemester = payload?.academicSemester;
  console.log(payload, 'payload');
  //check if there any registered semester that is already 'upcoming' or 'ongoing'
  const isUpcomingOrOngoingSemesterExist = await SemesterRegistration.findOne({
    // $or: [{ status: 'Upcoming' }, { status: 'Ongoing' }],
    $or: [
      { status: RegistrationStatus.Upcoming },
      { status: RegistrationStatus.Ongoing },
    ],
  });

  if (isUpcomingOrOngoingSemesterExist) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `There is already an ${isUpcomingOrOngoingSemesterExist.status} registered semester.`,
    );
  }

  //check if the semester is exist
  const isAcademicSemesterExist =
    await AcademicSemester.findById(academicSemester);
  if (!isAcademicSemesterExist) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'Academic Semester does not exist',
    );
  }

  //check if the semester registration is already registered or not
  const isSemesterRegistrationExist = await SemesterRegistration.findOne({
    academicSemester,
  });
  if (isSemesterRegistrationExist) {
    throw new AppError(
      httpStatus.CONFLICT,
      'Semester Registration is already registered',
    );
  }

  const result = await SemesterRegistration.create(payload);

  return result;
};
const getAllSemesterRegistrationFromDB = async (
  payload: Record<string, unknown>,
) => {
  const SemesterRegistrationQuery = new QueryBuilder(
    SemesterRegistration.find().populate('academicSemester'),
    payload,
  )
    .filter()
    .sort()
    .paginate()
    .fields();
  const result = await SemesterRegistrationQuery.modelQuery;
  return result;
};

const getSingleSemesterRegistrationFromDB = async (id: string) => {
  const result =
    await SemesterRegistration.findById(id).populate('academicSemester');
  return result;
};
const updateSemesterRegistrationFromDB = async (
  id: string,
  payload: Partial<TSemesterRegistration>,
) => {
  //check if the requested semester registration is exists
  const isSemesterRegistrationExist = await SemesterRegistration.findById(id);
  if (!isSemesterRegistrationExist) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Semester Registration does not exist',
    );
  }
  //if the requested semester registration in ended, we will not update anything

  //   const requestedSemester = await SemesterRegistration.findById(id);
  const currentSemesterStatus = isSemesterRegistrationExist?.status;
  const requestedStatus = payload?.status;
  //   if (requestedSemester?.status === 'Ended') {
  //   if (currentSemesterStatus === 'Ended') {
  if (currentSemesterStatus === RegistrationStatus.Ended) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Semester Registration is already ${currentSemesterStatus}`,
    );
  }
  //   if (currentSemesterStatus === 'Upcoming' && requestedStatus === 'Ended') {
  if (
    currentSemesterStatus === RegistrationStatus.Upcoming &&
    requestedStatus === RegistrationStatus.Ended
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `you can not directly change status form  ${currentSemesterStatus} to ${requestedStatus}`,
    );
  }
  //   if (currentSemesterStatus === 'Ongoing' && requestedStatus === 'Upcoming') {
  if (
    currentSemesterStatus === RegistrationStatus.Ongoing &&
    requestedStatus === RegistrationStatus.Upcoming
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `you can not directly change status form  ${currentSemesterStatus} to ${requestedStatus}`,
    );
  }

  const result = await SemesterRegistration.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
  return result;
};

const deleteSemesterRegistrationFromDB = async (id: string) => {
  /** 
  * Step1: Delete associated offered courses.
  * Step2: Delete semester registraton when the status is 
  'UPCOMING'.
  **/

  // checking if the semester registration is exist
  const isSemesterRegistrationExists = await SemesterRegistration.findById(id);

  if (!isSemesterRegistrationExists) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'This registered semester is not found !',
    );
  }

  // checking if the status is still "UPCOMING"
  const semesterRegistrationStatus = isSemesterRegistrationExists.status;

  if (semesterRegistrationStatus !== 'Upcoming') {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `You can not update as the registered semester is ${semesterRegistrationStatus}`,
    );
  }

  const session = await mongoose.startSession();

  //deleting associated offered courses

  try {
    session.startTransaction();

    const deletedOfferedCourse = await OfferedCourse.deleteMany(
      {
        semesterRegistration: id,
      },
      {
        session,
      },
    );

    if (!deletedOfferedCourse) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Failed to delete semester registration !',
      );
    }

    const deletedSemesterRegistration =
      await SemesterRegistration.findByIdAndDelete(id, {
        session,
        new: true,
      });

    if (!deletedSemesterRegistration) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Failed to delete semester registration !',
      );
    }

    await session.commitTransaction();
    await session.endSession();

    return null;
  } catch (err: any) {
    await session.abortTransaction();
    await session.endSession();
    throw new Error(err);
  }
};

export const SemesterRegistrationServices = {
  createSemesterRegistrationIntoDB,
  getAllSemesterRegistrationFromDB,
  getSingleSemesterRegistrationFromDB,
  updateSemesterRegistrationFromDB,
  deleteSemesterRegistrationFromDB,
};
