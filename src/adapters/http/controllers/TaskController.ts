import { Request, Response } from 'express';
import { z } from 'zod';
import {
  CreateTaskUseCase,
  GetTaskByIdUseCase,
  UpdateTaskUseCase,
  DeleteTaskUseCase,
  CreateBulkTasksUseCase,
  ListTasksByUserIdUseCase,
  CompleteTaskUseCase,
  UncompleteTaskUseCase,
} from '../../../core';

const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().max(1000).default(''),
});

const updateTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().max(1000).default(''),
});

const createBulkTaskSchema = z.object({
  tasks: z.array(
    z.object({
      title: z.string().min(1, 'Title is required').max(255),
      description: z.string().max(1000).optional(),
    })
  ).min(1, 'At least one task is required'),
});

export class TaskController {
  constructor(
    private createTaskUseCase: CreateTaskUseCase,
    private getTaskByIdUseCase: GetTaskByIdUseCase,
    private updateTaskUseCase: UpdateTaskUseCase,
    private deleteTaskUseCase: DeleteTaskUseCase,
    private createBulkTasksUseCase: CreateBulkTasksUseCase,
    private listTasksByUserIdUseCase: ListTasksByUserIdUseCase,
    private completeTaskUseCase: CompleteTaskUseCase,
    private uncompleteTaskUseCase: UncompleteTaskUseCase
  ) {}

  async create(req: Request, res: Response): Promise<void> {
    const { title, description } = createTaskSchema.parse(req.body);
    const userId = req.userId!;

    const output = await this.createTaskUseCase.execute({
      title,
      description,
      userId,
    });

    res.status(201).json(output);
  }

  async getById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const userId = req.userId!;

    const output = await this.getTaskByIdUseCase.execute({
      taskId: id,
      userId,
    });

    res.status(200).json(output);
  }

  async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const { title, description } = updateTaskSchema.parse(req.body);
    const userId = req.userId!;

    const output = await this.updateTaskUseCase.execute({
      taskId: id,
      title,
      description,
      userId,
    });

    res.status(200).json(output);
  }

  async delete(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const userId = req.userId!;

    await this.deleteTaskUseCase.execute({
      taskId: id,
      userId,
    });

    res.status(204).send();
  }

  async createBulk(req: Request, res: Response): Promise<void> {
    const { tasks } = createBulkTaskSchema.parse(req.body);
    const userId = req.userId!;

    const output = await this.createBulkTasksUseCase.execute({
      tasks,
      userId,
    });

    res.status(201).json(output);
  }

  async list(req: Request, res: Response): Promise<void> {
    const userId = req.userId!;

    const output = await this.listTasksByUserIdUseCase.execute({
      userId,
    });

    res.status(200).json(output);
  }

  async complete(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const userId = req.userId!;

    const output = await this.completeTaskUseCase.execute({
      taskId: id,
      userId,
    });

    res.status(200).json(output);
  }

  async uncomplete(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const userId = req.userId!;

    const output = await this.uncompleteTaskUseCase.execute({
      taskId: id,
      userId,
    });

    res.status(200).json(output);
  }
}

