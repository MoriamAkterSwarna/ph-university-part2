import mongoose from 'mongoose';
import app from './app';
import config from './app/config';
async function main() {
  try {
    // await mongoose.connect(process.env.DATABASE_URL as string)
    await mongoose.connect(config.db_url as string);

    app.listen(config.port, () => {
      console.log(`Example first app listening on port ${config.port}`);
    });
  } catch (err) {
    console.log(err);
  }
}
// main().catch(err => console.log(err))

main();
