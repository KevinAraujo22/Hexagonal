import { ITaskRepository, TaskNotFoundException, UnauthorizedException } from '../../core';

export interface UncompleteTaskInput {
  taskId: string;
  userId: string;
}

export interface UncompleteTaskOutput {
  id: string;
  title: string;
  completed: boolean;
  updatedAt: Date;
}

export class UncompleteTaskUseCase {
  constructor(private taskRepository: ITaskRepository) {}

  async execute(input: UncompleteTaskInput): Promise<UncompleteTaskOutput> {
    const task = await this.taskRepository.findById(input.taskId);

    if (!task) {
      throw new TaskNotFoundException(input.taskId);
    }

    if (task.userId !== input.userId) {
      throw new UnauthorizedException('You cannot uncomplete this task');
    }

    task.completed = false;
    task.updatedAt = new Date();
    await this.taskRepository.update(task);

    return {
      id: task.id,
      title: task.title,
      completed: task.completed,
      updatedAt: task.updatedAt,
    };
  }
}
