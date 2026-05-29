import { CreateBulkTasksUseCase, InvalidTaskException } from '../../../src/core';
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

describe('CreateBulkTasksUseCase', () => {
  let usecase: CreateBulkTasksUseCase;
  let mockRepository: MockTaskRepository;

  beforeEach(() => {
    mockRepository = new MockTaskRepository();
    usecase = new CreateBulkTasksUseCase(mockRepository);
  });

  it('should create multiple tasks successfully', async () => {
    const input = {
      tasks: [
        { title: 'Task 1', description: 'Desc 1' },
        { title: 'Task 2', description: 'Desc 2' },
        { title: 'Task 3', description: 'Desc 3' },
      ],
      userId: 'user-123',
    };

    jest.spyOn(mockRepository, 'saveBulk').mockResolvedValueOnce(undefined);

    const output = await usecase.execute(input);

    expect(output.created).toBe(3);
    expect(output.taskIds).toHaveLength(3);
    expect(mockRepository.saveBulk).toHaveBeenCalled();
  });

  it('should throw error when tasks array is empty', async () => {
    const input = {
      tasks: [],
      userId: 'user-123',
    };

    await expect(usecase.execute(input)).rejects.toThrow(
      InvalidTaskException
    );
  });

  it('should throw error when exceeds max bulk size (1000)', async () => {
    const tasks = Array(1001).fill({ title: 'Task', description: 'Desc' });

    const input = {
      tasks,
      userId: 'user-123',
    };

    await expect(usecase.execute(input)).rejects.toThrow(
      InvalidTaskException
    );
  });

  it('should throw error when any task has empty title', async () => {
    const input = {
      tasks: [
        { title: 'Task 1', description: 'Desc 1' },
        { title: '', description: 'Desc 2' },
      ],
      userId: 'user-123',
    };

    await expect(usecase.execute(input)).rejects.toThrow(
      InvalidTaskException
    );
  });

  it('should set default description to empty string', async () => {
    const input = {
      tasks: [
        { title: 'Task 1' },
        { title: 'Task 2' },
      ],
      userId: 'user-123',
    };

    jest.spyOn(mockRepository, 'saveBulk').mockResolvedValueOnce(undefined);

    const output = await usecase.execute(input);

    expect(output.created).toBe(2);
    expect(mockRepository.saveBulk).toHaveBeenCalled();
  });
});
