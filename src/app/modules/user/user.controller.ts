import { RequestHandler } from 'express';
import httpStatus from 'http-status';
import sendResponse from '../../utils/sendResponse';
import { UserServices } from './user.services';
import catchAsync from '../../utils/catchAsync';

// const createStudent = async (
//   req: Request,
//   res: Response,
//   next: NextFunction,
// ) => {
// const createStudent: RequestHandler = async (req, res, next) => {
//   try {
//     const { password, student: studentData } = req.body;

//     const result = await UserServices.createStudentIntoDB(
//       password,
//       studentData,
//     );

//     // res.status(200).json({
//     //   success: true,
//     //   message: 'Student is created Successfully',
//     //   data: result,
//     // });
//     sendResponse(res, {
//       statusCode: httpStatus.OK,
//       success: true,
//       message: 'Student is created Successfully',
//       data: result,
//     });

//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   } catch (error: any) {
//     next(error);
//   }
// };
const createStudent: RequestHandler = catchAsync(async (req, res) => {
  const { password, student: studentData } = req.body;

  const result = await UserServices.createStudentIntoDB(password, studentData);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Student is created Successfully',
    data: result,
  });
});

export const UserControllers = {
  createStudent,
};
