import { ITaskRepository, TaskNotFoundException, UnauthorizedException } from '../../core';

export interface GetTaskByIdInput {
  taskId: string;
  userId: string;
}

export interface GetTaskByIdOutput {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export class GetTaskByIdUseCase {
  constructor(private taskRepository: ITaskRepository) {}

  async execute(input: GetTaskByIdInput): Promise<GetTaskByIdOutput> {
    const task = await this.taskRepository.findById(input.taskId);

    if (!task) {
      throw new TaskNotFoundException(input.taskId);
    }

    if (task.userId !== input.userId) {
      throw new UnauthorizedException('You cannot access this task');
    }

    return {
      id: task.id,
      title: task.title,
      description: task.description,
      completed: task.completed,
      userId: task.userId,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    };
  }
}
