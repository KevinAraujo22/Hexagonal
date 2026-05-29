import { Task, ITaskRepository, InvalidTaskException } from '../../core';

export interface CreateBulkTaskInput {
  tasks: Array<{
    title: string;
    description?: string;
  }>;
  userId: string;
}

export interface CreateBulkTaskOutput {
  created: number;
  taskIds: string[];
}

export class CreateBulkTasksUseCase {
  private readonly MAX_BULK_SIZE = 1000;

  constructor(private taskRepository: ITaskRepository) {}

  async execute(input: CreateBulkTaskInput): Promise<CreateBulkTaskOutput> {
    if (input.tasks.length === 0) {
      throw new InvalidTaskException('At least one task is required');
    }

    if (input.tasks.length > this.MAX_BULK_SIZE) {
      throw new InvalidTaskException(
        `Cannot create more than ${this.MAX_BULK_SIZE} tasks at once`
      );
    }

    for (const taskInput of input.tasks) {
      if (!taskInput.title || taskInput.title.trim().length === 0) {
        throw new InvalidTaskException('All tasks must have a title');
      }
    }

    const tasks = input.tasks.map((taskInput) =>
      Task.create(
        taskInput.title,
        taskInput.description || '',
        input.userId
      )
    );

    await this.taskRepository.saveBulk(tasks);

    return {
      created: tasks.length,
      taskIds: tasks.map((task) => task.id),
    };
  }
}
