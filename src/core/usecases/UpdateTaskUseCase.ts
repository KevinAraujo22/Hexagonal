import { ITaskRepository, TaskNotFoundException, UnauthorizedException } from '../../core';

export interface UpdateTaskInput {
  taskId: string;
  title: string;
  description: string;
  userId: string;
}

export interface UpdateTaskOutput {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  updatedAt: Date;
}

export class UpdateTaskUseCase {
  constructor(private taskRepository: ITaskRepository) {}

  async execute(input: UpdateTaskInput): Promise<UpdateTaskOutput> {
    const task = await this.taskRepository.findById(input.taskId);

    if (!task) {
      throw new TaskNotFoundException(input.taskId);
    }

    if (task.userId !== input.userId) {
      throw new UnauthorizedException('You cannot update this task');
    }

    task.update(input.title, input.description);
    await this.taskRepository.update(task);

    return {
      id: task.id,
      title: task.title,
      description: task.description,
      completed: task.completed,
      updatedAt: task.updatedAt,
    };
  }
}
