import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { config } from './config';

let mongoServer: MongoMemoryServer | null = null;

export async function connectDB(): Promise<void> {
  if (config.mongoUri) {
    await mongoose.connect(config.mongoUri);
    console.log('🗄️  Connected to MongoDB (external URI)');
  } else {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
    console.log('🗄️  Connected to in-memory MongoDB (dev mode)');
  }
}
