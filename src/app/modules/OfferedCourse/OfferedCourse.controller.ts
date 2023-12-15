import catchAsync from '../../utils/catchAsync';
import { OfferedCourseServices } from './OfferedCourse.services';

const createOfferedCourse = catchAsync(async (req, res) => {
  const offeredCourse = await OfferedCourseServices.createOfferedCourseIntoDb(
    req.body,
  );
  res.status(201).json({
    status: 'success',
    data: {
      offeredCourse,
    },
  });
});

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

export const OfferedCourseController = {
  createOfferedCourse,
  updateOfferedCourse,
};
