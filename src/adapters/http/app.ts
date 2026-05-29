import express, { Express } from 'express';
import cors from 'cors';
import { createTaskRoutes } from './routes/taskRoutes';
import { globalErrorHandler } from './middlewares';
import { ITaskRepository } from '../../core';

export function createApp(taskRepository: ITaskRepository): Express {
  const app = express();

  app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
  }));
  app.use(express.json());

  app.use('/tasks', createTaskRoutes(taskRepository));

  app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  app.use(globalErrorHandler);

  return app;
}
