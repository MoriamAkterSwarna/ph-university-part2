import { RequestHandler } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { UserServices } from './user.services';

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
  console.log(req.file, 'file');
  const file = req.file;
  // console.log(JSON.parse(req.body.data), 'data');
  console.log(req.body);
  const { password, student: studentData } = req.body;

  const result = await UserServices.createStudentIntoDB(
    file,
    password,
    studentData,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Student is created Successfully',
    data: result,
  });
});
const createFaculty = catchAsync(async (req, res) => {
  const { password, faculty: facultyData } = req.body;

  const result = await UserServices.createFacultyIntoDB(password, facultyData);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Faculty is created successfully',
    data: result,
  });
});

const createAdmin = catchAsync(async (req, res) => {
  const { password, admin: adminData } = req.body;

  const result = await UserServices.createAdminIntoDB(password, adminData);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Admin is created successfully',
    data: result,
  });
});

const getMe = catchAsync(async (req, res) => {
  // const token = req.headers.authorization;
  // if (!token) throw new AppError(httpStatus.UNAUTHORIZED, 'Token Not found');
  console.log(req.user);
  // const result = await UserServices.getMe(token);

  const { userId, role } = req.user;
  const result = await UserServices.getMe(userId, role);
  console.log(result);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User is fetched successfully',
    data: result,
  });
});
const changeStatus = catchAsync(async (req, res) => {
  const { id } = req.params;

  const result = await UserServices.changeStatus(id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User status is changed successfully',
    data: result,
  });
});
export const UserControllers = {
  createStudent,
  createFaculty,
  createAdmin,
  getMe,
  changeStatus,
};
