import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { OfferedCourseController } from './OfferedCourse.controller';
import { OfferedCourseValidation } from './OfferedCourse.validation';

const router = express.Router();
router.post(
  '/create-offered-course',
  validateRequest(OfferedCourseValidation.createOfferedCourseValidationSchema),
  OfferedCourseController.createOfferedCourse,
);
router.patch(
  '/:id',
  validateRequest(OfferedCourseValidation.updateOfferedCourseValidationSchema),
  OfferedCourseController.updateOfferedCourse,
);

export const OfferedCourseRoutes = router;
