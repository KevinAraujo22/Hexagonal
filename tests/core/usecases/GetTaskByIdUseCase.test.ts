import { GetTaskByIdUseCase, Task, TaskNotFoundException, UnauthorizedException } from '../../../src/core';
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

describe('GetTaskByIdUseCase', () => {
  let usecase: GetTaskByIdUseCase;
  let mockRepository: MockTaskRepository;

  beforeEach(() => {
    mockRepository = new MockTaskRepository();
    usecase = new GetTaskByIdUseCase(mockRepository);
  });

  it('should get task by id successfully', async () => {
    const task = Task.create('Learn TypeScript', 'Master TS', 'user-123');

    jest.spyOn(mockRepository, 'findById').mockResolvedValueOnce(task as any);

    const output = await usecase.execute({
      taskId: task.id,
      userId: 'user-123',
    });

    expect(output.id).toBe(task.id);
    expect(output.title).toBe('Learn TypeScript');
    expect(mockRepository.findById).toHaveBeenCalledWith(task.id);
  });

  it('should throw TaskNotFoundException when task does not exist', async () => {
    jest.spyOn(mockRepository, 'findById').mockResolvedValueOnce(null);

    await expect(
      usecase.execute({
        taskId: 'non-existent-id',
        userId: 'user-123',
      })
    ).rejects.toThrow(TaskNotFoundException);
  });

  it('should throw UnauthorizedException when user is not the owner', async () => {
    const task = Task.create('Learn TypeScript', 'Master TS', 'user-456');

    jest.spyOn(mockRepository, 'findById').mockResolvedValueOnce(task as any);

    await expect(
      usecase.execute({
        taskId: task.id,
        userId: 'user-123',
      })
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should return complete task data', async () => {
    const task = Task.create('Test Task', 'Test Description', 'user-123');

    jest.spyOn(mockRepository, 'findById').mockResolvedValueOnce(task as any);

    const output = await usecase.execute({
      taskId: task.id,
      userId: 'user-123',
    });

    expect(output).toEqual({
      id: task.id,
      title: 'Test Task',
      description: 'Test Description',
      completed: false,
      userId: 'user-123',
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    });
  });
});
