import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { OfferedCourseServices } from './OfferedCourse.services';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';

const createOfferedCourse = catchAsync(async (req, res) => {
  const offeredCourse = await OfferedCourseServices.createOfferedCourseIntoDb(
    req.body,
  );
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'OfferedCourse created successfully',
    data: offeredCourse,
  });
});
const getAllOfferedCourses = catchAsync(async (req, res) => {
  const result = await OfferedCourseServices.getAllOfferedCoursesFromDB(
    req.query,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'OfferedCourses retrieved successfully !',
    data: result,
  });
});

const getSingleOfferedCourses = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await OfferedCourseServices.getSingleOfferedCourseFromDB(id);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'OfferedCourse fetched successfully',
      data: result,
    });
  },
);

const updateOfferedCourse = catchAsync(async (req, res) => {
  const offeredCourse = await OfferedCourseServices.updateOfferedCourseIntoDb(
    req.params.id,
    req.body,
  );
  res.status(200).json({
    status: 'success',
    data: {
      offeredCourse,
    },
  });
});

const deleteOfferedCourse = catchAsync(async (req, res) => {
  const { id } = req.params;
  await OfferedCourseServices.deleteOfferedCourseFromDB(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'OfferedCourse deleted successfully',
    data: null,
  });
});

export const OfferedCourseController = {
  createOfferedCourse,
  updateOfferedCourse,
  getAllOfferedCourses,
  getSingleOfferedCourses,
  deleteOfferedCourse,
};
