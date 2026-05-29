import { Task, ITaskRepository, InvalidTaskException } from '../../core';

export interface CreateTaskInput {
  title: string;
  description: string;
  userId: string;
}

export interface CreateTaskOutput {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

export class CreateTaskUseCase {
  constructor(private taskRepository: ITaskRepository) {}

  async execute(input: CreateTaskInput): Promise<CreateTaskOutput> {
    if (!input.title || input.title.trim().length === 0) {
      throw new InvalidTaskException('Task title cannot be empty');
    }

    const task = Task.create(input.title, input.description, input.userId);

    await this.taskRepository.save(task);

    return {
      id: task.id,
      title: task.title,
      description: task.description,
      completed: task.completed,
    };
  }
}
