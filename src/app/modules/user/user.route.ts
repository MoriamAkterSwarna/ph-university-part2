import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { createStudentZodValidationSchema } from '../student/student.zod.validation';
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
  validateRequest(createStudentZodValidationSchema),
  UserControllers.createStudent,
);

export const UserRoutes = router;
