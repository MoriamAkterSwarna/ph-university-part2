import cors from 'cors'
import express, { Application, Request, Response } from 'express'
import { StudentRoutes } from './app/modules/student/student.route'

const app: Application = express()

//parsers
app.use(express.json())
app.use(cors())

//application routes
app.use('/api/v1/students', StudentRoutes)

const getAController = async (req: Request, res: Response) => {
  res.send('Hello World...................Hi hi bye bye!')
}

app.get('/', getAController)
// app.get('/', (req: Request, res: Response) => {
//   res.send('Hello World...................!')
// })

// console.log(process.cwd()); // current directory

export default app
