import { NextFunction, Request, Response } from 'express';
import { AnyZodObject } from 'zod';

const validateRequest = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // console.log(req.body);
    // console.log(`shena bahini ${name}`);

    try {
      // validation
      //if everything ok next() =>
      await schema.parseAsync({ body: req.body });
      next();
    } catch (err) {
      next(err);
    }
  };
};

export default validateRequest;
