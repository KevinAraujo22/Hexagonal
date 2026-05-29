import { CompleteTaskUseCase, Task, TaskNotFoundException, UnauthorizedException } from '../../../src/core';
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

describe('CompleteTaskUseCase', () => {
  let usecase: CompleteTaskUseCase;
  let mockRepository: MockTaskRepository;

  beforeEach(() => {
    mockRepository = new MockTaskRepository();
    usecase = new CompleteTaskUseCase(mockRepository);
  });

  it('should complete task successfully', async () => {
    const task = Task.create('Title', 'Description', 'user-123');
    expect(task.completed).toBe(false);

    jest.spyOn(mockRepository, 'findById').mockResolvedValueOnce(task as any);
    jest.spyOn(mockRepository, 'update').mockResolvedValueOnce(undefined);

    const output = await usecase.execute({
      taskId: task.id,
      userId: 'user-123',
    });

    expect(output.completed).toBe(true);
    expect(mockRepository.update).toHaveBeenCalled();
  });

  it('should throw TaskNotFoundException when task does not exist', async () => {
    jest.spyOn(mockRepository, 'findById').mockResolvedValueOnce(null);

    await expect(
      usecase.execute({
        taskId: 'non-existent',
        userId: 'user-123',
      })
    ).rejects.toThrow(TaskNotFoundException);
  });

  it('should throw UnauthorizedException when user is not the owner', async () => {
    const task = Task.create('Title', 'Description', 'user-456');

    jest.spyOn(mockRepository, 'findById').mockResolvedValueOnce(task as any);

    await expect(
      usecase.execute({
        taskId: task.id,
        userId: 'user-123',
      })
    ).rejects.toThrow(UnauthorizedException);
  });
});
