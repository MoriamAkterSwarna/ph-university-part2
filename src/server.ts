import { Server } from 'http';
import mongoose from 'mongoose';
import app from './app';
import config from './app/config';
let server: Server;
async function main() {
  try {
    // await mongoose.connect(process.env.DATABASE_URL as string)
    await mongoose.connect(config.db_url as string);

    server = app.listen(config.port, () => {
      console.log(`Example first app listening on port ${config.port}`);
    });
  } catch (err) {
    console.log(err);
  }
}
// main().catch(err => console.log(err))

main();
process.on('unhandledRejection', () => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
  process.exit(1);
});
// Promise.reject()

process.on('uncaughtException', () => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  process.exit(1);
});
// console.log(x);
