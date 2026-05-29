import { DeleteTaskUseCase, Task, TaskNotFoundException, UnauthorizedException } from '../../../src/core';
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

describe('DeleteTaskUseCase', () => {
  let usecase: DeleteTaskUseCase;
  let mockRepository: MockTaskRepository;

  beforeEach(() => {
    mockRepository = new MockTaskRepository();
    usecase = new DeleteTaskUseCase(mockRepository);
  });

  it('should delete task successfully', async () => {
    const task = Task.create('Title', 'Description', 'user-123');

    jest.spyOn(mockRepository, 'findById').mockResolvedValueOnce(task as any);
    jest.spyOn(mockRepository, 'delete').mockResolvedValueOnce(undefined);

    await usecase.execute({
      taskId: task.id,
      userId: 'user-123',
    });

    expect(mockRepository.delete).toHaveBeenCalledWith(task.id);
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
