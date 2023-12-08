import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { CourseControllers } from './course.controller';
import { CourseValidation } from './course.validation';

const router = express.Router();

router.post(
  '/create-course',
  validateRequest(CourseValidation.createCourseValidationSchema),
  CourseControllers.createCourse,
);
router.get('/:id', CourseControllers.getSingleCourses);

router.patch(
  '/:id',
  validateRequest(CourseValidation.updateCourseValidationSchema),
  CourseControllers.updateCourse,
);
router.put(
  '/:courseId/assign-faculties',
  validateRequest(CourseValidation.FacultiesValidationSchema),
  CourseControllers.assignFaculties,
);
router.delete(
  '/:courseId/remove-faculties',
  validateRequest(CourseValidation.FacultiesValidationSchema),
  CourseControllers.removeFaculties,
);

router.get('/', CourseControllers.getAllCourses);
router.delete('/:id', CourseControllers.deleteCourse);
export const CourseRoutes = router;
