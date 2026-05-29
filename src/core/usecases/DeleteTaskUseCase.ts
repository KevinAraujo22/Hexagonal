import { ITaskRepository, TaskNotFoundException, UnauthorizedException } from '../../core';

export interface DeleteTaskInput {
  taskId: string;
  userId: string;
}

export class DeleteTaskUseCase {
  constructor(private taskRepository: ITaskRepository) {}

  async execute(input: DeleteTaskInput): Promise<void> {
    const task = await this.taskRepository.findById(input.taskId);

    if (!task) {
      throw new TaskNotFoundException(input.taskId);
    }

    if (task.userId !== input.userId) {
      throw new UnauthorizedException('You cannot delete this task');
    }

    await this.taskRepository.delete(input.taskId);
  }
}
