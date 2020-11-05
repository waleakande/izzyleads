import mongoose from 'mongoose';
import config from 'config';

export default async () => {
  const connection = await mongoose.connect(process.env.MONGODB_URL, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
  });
  return connection.connection.db;
};
