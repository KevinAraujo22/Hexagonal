import dotenv from 'dotenv';
import { MongoDBConnection, MongooseTaskRepository, createApp } from './adapters';

dotenv.config();

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/task-management';

async function main() {
  try {
    console.log('Task Management API is starting...');
    console.log(`Environment: ${process.env.NODE_ENV}`);

    await MongoDBConnection.connect(MONGODB_URI);

    const taskRepository = new MongooseTaskRepository();

    const app = createApp(taskRepository);

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`Health check: GET http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('Error starting application:', error);
    process.exit(1);
  }
}

main();
