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
router.get('/', OfferedCourseController.getAllOfferedCourses);
router.get('/:id', OfferedCourseController.getSingleOfferedCourses);
router.patch(
  '/:id',
  validateRequest(OfferedCourseValidation.updateOfferedCourseValidationSchema),
  OfferedCourseController.updateOfferedCourse,
);
router.delete('/:id', OfferedCourseController.deleteOfferedCourse);

export const OfferedCourseRoutes = router;
