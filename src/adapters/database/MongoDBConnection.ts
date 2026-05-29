import mongoose from 'mongoose';

export class MongoDBConnection {
  static async connect(uri: string): Promise<void> {
    try {
      await mongoose.connect(uri);
      console.log('MongoDB connected successfully');
    } catch (error) {
      console.error('MongoDB connection failed:', error);
      throw error;
    }
  }

  static async disconnect(): Promise<void> {
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  }
}
