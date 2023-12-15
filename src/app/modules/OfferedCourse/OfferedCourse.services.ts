/* eslint-disable @typescript-eslint/no-unused-vars */
import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { AcademicDepartment } from '../academicDepartment/academicDepartment.model';
import { AcademicFaculty } from '../academicFaculty/academicFaculty.model';
import { Course } from '../course/course.model';
import { Faculty } from '../faculty/faculty.model';
import { SemesterRegistration } from '../semesterRegistration/semesterRegistration.model';
import { TOfferedCourse } from './OfferedCourse.interface';
import { OfferedCourse } from './OfferedCourse.model';
import { hasTimeConflict } from './OfferedCourse.utils';

const createOfferedCourseIntoDb = async (payload: TOfferedCourse) => {
  //check  if the semester registration id is exists
  const {
    semesterRegistration,

    academicFaculty,
    academicDepartment,
    course,
    section,
    faculty,
    days,
    startTime,
    endTime,
  } = payload;

  const isSemesterRegistrationExists =
    await SemesterRegistration.findById(semesterRegistration);

  if (!isSemesterRegistrationExists) {
    throw new AppError(httpStatus.NOT_FOUND, 'Semester Registration not found');
  }
  const academicSemester = isSemesterRegistrationExists.academicSemester;

  const isAcademicFacultyExists =
    await AcademicFaculty.findById(academicFaculty);

  if (!isAcademicFacultyExists) {
    throw new AppError(httpStatus.NOT_FOUND, 'Academic Faculty not found');
  }
  const isAcademicDepartmentExists =
    await AcademicDepartment.findById(academicDepartment);

  if (!isAcademicDepartmentExists) {
    throw new AppError(httpStatus.NOT_FOUND, 'Academic Department not found');
  }
  const isCourseExists = await Course.findById(course);

  if (!isCourseExists) {
    throw new AppError(httpStatus.NOT_FOUND, 'Course not found');
  }
  const isFacultyExists = await Faculty.findById(faculty);

  if (!isFacultyExists) {
    throw new AppError(httpStatus.NOT_FOUND, 'Faculty not found');
  }

  //check if the department is belong to the faculty
  const isDepartmentBelongToFacultyExists = await AcademicDepartment.findOne({
    _id: academicDepartment,
    academicFaculty,
  });
  if (!isDepartmentBelongToFacultyExists) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      `${isAcademicDepartmentExists.name} Department not belong to this ${isAcademicFacultyExists.name} faculty`,
    );
  }

  //check if the same offered course same section in same registered semester is exists
  const isOfferedCourseSameRegisteredSemesterExistsWithSameSection =
    await OfferedCourse.findOne({
      semesterRegistration,
      course,
      section,
    });
  if (isOfferedCourseSameRegisteredSemesterExistsWithSameSection) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Offered Course with same section in same registered semester is already exists`,
    );
  }
  //get the schedules of the course
  const assignedSchedules = await OfferedCourse.find({
    semesterRegistration,
    faculty,
    days: { $in: days },
  }).select('days startTime endTime');
  // console.log(assignedSchedules);

  const newSchedule = {
    days,
    startTime,
    endTime,
  };

  // assignedSchedules.forEach(schedule => {
  //   const existingStartTime = new Date(`1970-01-01T${schedule.startTime}`);
  //   const existingEndTime = new Date(`1970-01-01T${schedule.endTime}`);
  //   const newStartTime = new Date(`1970-01-01T${newSchedule.startTime}`);
  //   const newEndTime = new Date(`1970-01-01T${newSchedule.endTime}`);

  //   if (newStartTime < existingEndTime && newEndTime > existingStartTime) {
  //     throw new AppError(
  //       httpStatus.CONFLICT,
  //       `This faculty is not available at that time! Choose other time or date.`,
  //     );
  //   }
  // });

  // console.log(hasTimeConflict(assignedSchedules, newSchedule));
  if (hasTimeConflict(assignedSchedules, newSchedule)) {
    throw new AppError(
      httpStatus.CONFLICT,
      `This faculty is not available at that time! Choose other time or date.`,
    );
  }
  const createdOfferedCourse = await OfferedCourse.create({
    ...payload,
    academicSemester,
  });
  return createdOfferedCourse;
  // return null;
};

const updateOfferedCourseIntoDb = async (
  id: string,
  payload: Pick<TOfferedCourse, 'faculty' | 'days' | 'startTime' | 'endTime'>,
) => {
  const { faculty, days, startTime, endTime } = payload;
  const isOfferedCourseExists = await OfferedCourse.findById(id);

  if (!isOfferedCourseExists) {
    throw new AppError(httpStatus.NOT_FOUND, 'Offered course not found');
  }
  const semesterRegistration = isOfferedCourseExists.semesterRegistration;

  const isFacultyExists = await Faculty.findById(faculty);

  const semesterRegistrationStatus =
    await SemesterRegistration.findById(semesterRegistration);
  if (semesterRegistrationStatus?.status !== 'Upcoming') {
    throw new AppError(
      httpStatus.NOT_FOUND,
      `You can not update this offered course as it is ${semesterRegistrationStatus?.status}.`,
    );
  }

  if (!isFacultyExists) {
    throw new AppError(httpStatus.NOT_FOUND, 'Faculty not found');
  }

  const assignedSchedules = await OfferedCourse.find({
    semesterRegistration,
    faculty,
    days: { $in: days },
  }).select('days startTime endTime');
  // console.log(assignedSchedules);

  const newSchedule = {
    days,
    startTime,
    endTime,
  };
  if (hasTimeConflict(assignedSchedules, newSchedule)) {
    throw new AppError(
      httpStatus.CONFLICT,
      `This faculty is not available at that time! Choose other time or date.`,
    );
  }

  const result = await OfferedCourse.findByIdAndUpdate(id, payload, {
    new: true,
  });
  return result;
};

export const OfferedCourseServices = {
  createOfferedCourseIntoDb,
  updateOfferedCourseIntoDb,
};
