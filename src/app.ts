/* eslint-disable prefer-const */
/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import cors from 'cors';
import express, { Application, Request, Response } from 'express';
import globalErrorHandler from './app/middlewares/globalErrorHandlers';
import notFound from './app/middlewares/not-found';
import { router } from './app/routes';

const app: Application = express();

//parsers
app.use(express.json());
app.use(cors());

//application routes
// app.use('/api/v1/students', StudentRoutes);
// app.use('/api/v1/users', UserRoutes);

app.use('/api/v1', router);

const test = async (req: Request, res: Response) => {
  res.send('Hello World...................Hi hi bye bye!');
};

app.get('/', test);
app.use(globalErrorHandler);

//not found
app.use(notFound);

export default app;
