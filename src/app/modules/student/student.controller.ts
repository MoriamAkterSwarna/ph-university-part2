/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import { StudentServices } from './student.service';
import sendResponse from '../../utils/sendResponse';
import catchAsync from '../../utils/catchAsync';

// const catchAsync = (fn: RequestHandler) => {
//   return (req: Request, res: Response, next: NextFunction) => {
//     Promise.resolve(fn(req, res, next)).catch(err => next(err));
//   };
// };

// const getAllStudents: RequestHandler = async (req, res, next) => {
// const getAllStudents = catchAsync(async (req, res, next) => {       //catchAsync function from this file
const getAllStudents = catchAsync(async (req, res) => {
  //catchAsync function from catchAsync.ts file
  const result = await StudentServices.getAllStudentsFromDB();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Student is retrieved successfully',
    data: result,
  });
});
const getSingleStudent = catchAsync(async (req, res) => {
  const { studentId } = req.params;
  const result = await StudentServices.getSingleStudentsFromDB(studentId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Single Student is retrieved Successfully',
    data: result,
  });
});
const deleteStudent = catchAsync(async (req, res) => {
  const { studentId } = req.params;
  const result = await StudentServices.deleteStudentFromDB(studentId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Student is created Successfully',
    data: result,
  });
});
// const deleteStudent: RequestHandler = async (req, res, next) => {
//   try {
//     const { studentId } = req.params;
//     const result = await StudentServices.deleteStudentFromDB(studentId);
//     sendResponse(res, {
//       statusCode: httpStatus.OK,
//       success: true,
//       message: 'Student is created Successfully',
//       data: result,
//     });
//   } catch (error: any) {
//     next(error);
//   }
// };

export const StudentControllers = {
  getAllStudents,
  getSingleStudent,
  deleteStudent,
};
