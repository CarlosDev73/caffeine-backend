import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer;

export const connectTestDB = async () => {
  try {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
    console.log(' 💾 Connected to in-memory MongoDB for tests');
  } catch (error) {
    console.error(' ❌ Error connecting to in-memory MongoDB:', error.message);
  }
};

export const disconnectTestDB = async () => {
  try {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
    console.log(' 🛑 In-memory MongoDB disconnected');
  } catch (error) {
    console.error(' ❌ Error disconnecting from in-memory MongoDB:', error.message);
  }
};
