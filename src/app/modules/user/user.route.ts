import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { createAdminValidationSchema } from '../admin/admin.validation';
import { createFacultyValidationSchema } from '../faculty/faculty.validation';
import { createStudentZodValidationSchema } from '../student/student.zod.validation';
import { USER_ROLE } from './user.constant';
import { UserControllers } from './user.controller';

// const validateRequest = (schema: AnyZodObject) => {
//   return async (req: Request, res: Response, next: NextFunction) => {
//     // console.log(req.body);
//     // console.log(`shena bahini ${name}`);

//     try {
//       // validation
//       //if everything ok next() =>
//       await schema.parseAsync({ body: req.body });
//       next();
//     } catch (err) {
//       next(err);
//     }
//   };
// };
const router = express.Router();

//will call controller function
// router.post('/create-student', UserControllers.createStudent);
router.post(
  '/create-student',
  auth(USER_ROLE.admin),
  validateRequest(createStudentZodValidationSchema),
  UserControllers.createStudent,
);
router.post(
  '/create-faculty',
  auth(USER_ROLE.admin),
  validateRequest(createFacultyValidationSchema),
  UserControllers.createFaculty,
);

router.post(
  '/create-admin',
  validateRequest(createAdminValidationSchema),
  UserControllers.createAdmin,
);

export const UserRoutes = router;
