import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { StudentControllers } from './student.controller';
import { updateStudentValidationSchema } from './student.zod.validation';
import auth from '../../middlewares/auth';

const router = express.Router();

//will call controller function
// router.post('/create-student', StudentControllers.createStudent);
router.get('/get-all-students', StudentControllers.getAllStudents);
// router.get(
//   '/get-single-student/:studentId',
//   StudentControllers.getSingleStudent,
// );
router.get(
  '/get-single-student/:id',
  auth('faculty', 'admin'),
  StudentControllers.getSingleStudent,
);
// router.patch(
//   '/:studentId',
//   validateRequest(updateStudentValidationSchema),
//   StudentControllers.updateStudent,
// );
router.patch(
  '/:id',
  validateRequest(updateStudentValidationSchema),
  StudentControllers.updateStudent,
);
// router.delete('/:studentId', StudentControllers.deleteStudent);
router.delete('/:id', StudentControllers.deleteStudent);

export const StudentRoutes = router;
