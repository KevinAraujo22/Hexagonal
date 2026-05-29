import { ListTasksByUserIdUseCase, Task } from '../../../src/core';
import { ITaskRepository } from '../../../src/core';

class MockTaskRepository implements ITaskRepository {
  async save(): Promise<void> {}
  async findById() {
    return null;
  }
  async findByUserId() {
    return [];
  }
  async update(): Promise<void> {}
  async delete(): Promise<void> {}
  async saveBulk(): Promise<void> {}
}

describe('ListTasksByUserIdUseCase', () => {
  let usecase: ListTasksByUserIdUseCase;
  let mockRepository: MockTaskRepository;

  beforeEach(() => {
    mockRepository = new MockTaskRepository();
    usecase = new ListTasksByUserIdUseCase(mockRepository);
  });

  it('should list tasks for user', async () => {
    const task1 = Task.create('Task 1', 'Desc 1', 'user-123');
    const task2 = Task.create('Task 2', 'Desc 2', 'user-123');

    jest.spyOn(mockRepository, 'findByUserId').mockResolvedValueOnce([task1, task2] as any);

    const output = await usecase.execute({ userId: 'user-123' });

    expect(output.tasks).toHaveLength(2);
    expect(output.tasks[0].title).toBe('Task 1');
    expect(output.tasks[1].title).toBe('Task 2');
  });

  it('should return empty list when user has no tasks', async () => {
    jest.spyOn(mockRepository, 'findByUserId').mockResolvedValueOnce([]);

    const output = await usecase.execute({ userId: 'user-456' });

    expect(output.tasks).toHaveLength(0);
  });

  it('should include all task properties', async () => {
    const task = Task.create('Task', 'Desc', 'user-123');

    jest.spyOn(mockRepository, 'findByUserId').mockResolvedValueOnce([task] as any);

    const output = await usecase.execute({ userId: 'user-123' });

    expect(output.tasks[0]).toEqual({
      id: task.id,
      title: task.title,
      description: task.description,
      completed: task.completed,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    });
  });
});
