import { ITaskRepository, TaskNotFoundException, UnauthorizedException } from '../../core';

export interface CompleteTaskInput {
  taskId: string;
  userId: string;
}

export interface CompleteTaskOutput {
  id: string;
  title: string;
  completed: boolean;
  updatedAt: Date;
}

export class CompleteTaskUseCase {
  constructor(private taskRepository: ITaskRepository) {}

  async execute(input: CompleteTaskInput): Promise<CompleteTaskOutput> {
    const task = await this.taskRepository.findById(input.taskId);

    if (!task) {
      throw new TaskNotFoundException(input.taskId);
    }

    if (task.userId !== input.userId) {
      throw new UnauthorizedException('You cannot complete this task');
    }

    task.complete();
    await this.taskRepository.update(task);

    return {
      id: task.id,
      title: task.title,
      completed: task.completed,
      updatedAt: task.updatedAt,
    };
  }
}
