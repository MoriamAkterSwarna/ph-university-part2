import { NextFunction, Request, Response } from 'express';
import { AnyZodObject } from 'zod';
import catchAsync from '../utils/catchAsync';

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
const validateRequest = (schema: AnyZodObject) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    await schema.parseAsync({ body: req.body, cookies: req.cookies });
    next();
  });
};

export default validateRequest;
