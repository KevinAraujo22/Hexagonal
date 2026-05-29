import { ITaskRepository } from '../../core';

export interface ListTasksInput {
  userId: string;
}

export interface ListTasksOutput {
  tasks: Array<{
    id: string;
    title: string;
    description: string;
    completed: boolean;
    createdAt: Date;
    updatedAt: Date;
  }>;
}

export class ListTasksByUserIdUseCase {
  constructor(private taskRepository: ITaskRepository) {}

  async execute(input: ListTasksInput): Promise<ListTasksOutput> {
    const tasks = await this.taskRepository.findByUserId(input.userId);

    return {
      tasks: tasks.map((task) => ({
        id: task.id,
        title: task.title,
        description: task.description,
        completed: task.completed,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
      })),
    };
  }
}
