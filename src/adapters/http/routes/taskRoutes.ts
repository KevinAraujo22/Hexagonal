import { Router, Request, Response, NextFunction } from 'express';
import {
  ITaskRepository,
  CreateTaskUseCase,
  GetTaskByIdUseCase,
  UpdateTaskUseCase,
  DeleteTaskUseCase,
  CreateBulkTasksUseCase,
  ListTasksByUserIdUseCase,
  CompleteTaskUseCase,
  UncompleteTaskUseCase,
} from '../../../core';
import { TaskController } from '../controllers/TaskController';
import { authMiddleware } from '../middlewares';

export function createTaskRoutes(taskRepository: ITaskRepository): Router {
  const router = Router();

  const createTaskUseCase = new CreateTaskUseCase(taskRepository);
  const getTaskByIdUseCase = new GetTaskByIdUseCase(taskRepository);
  const updateTaskUseCase = new UpdateTaskUseCase(taskRepository);
  const deleteTaskUseCase = new DeleteTaskUseCase(taskRepository);
  const createBulkTasksUseCase = new CreateBulkTasksUseCase(taskRepository);
  const listTasksByUserIdUseCase = new ListTasksByUserIdUseCase(taskRepository);
  const completeTaskUseCase = new CompleteTaskUseCase(taskRepository);
  const uncompleteTaskUseCase = new UncompleteTaskUseCase(taskRepository);

  const taskController = new TaskController(
    createTaskUseCase,
    getTaskByIdUseCase,
    updateTaskUseCase,
    deleteTaskUseCase,
    createBulkTasksUseCase,
    listTasksByUserIdUseCase,
    completeTaskUseCase,
    uncompleteTaskUseCase
  );

  router.post('/', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
      await taskController.create(req, res);
    } catch (err) {
      next(err);
    }
  });

  router.post('/bulk/create', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
      await taskController.createBulk(req, res);
    } catch (err) {
      next(err);
    }
  });

  router.get('/', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
      await taskController.list(req, res);
    } catch (err) {
      next(err);
    }
  });

  router.get('/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
      await taskController.getById(req, res);
    } catch (err) {
      next(err);
    }
  });

  router.patch('/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
      await taskController.update(req, res);
    } catch (err) {
      next(err);
    }
  });

  router.patch('/:id/complete', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
      await taskController.complete(req, res);
    } catch (err) {
      next(err);
    }
  });

  router.patch('/:id/uncomplete', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
      await taskController.uncomplete(req, res);
    } catch (err) {
      next(err);
    }
  });

  router.delete('/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
      await taskController.delete(req, res);
    } catch (err) {
      next(err);
    }
  });

  return router;
}

