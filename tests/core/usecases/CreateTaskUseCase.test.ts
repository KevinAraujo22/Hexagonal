import { CreateTaskUseCase } from '../../../src/core';
import { ITaskRepository } from '../../../src/core';
import { InvalidTaskException } from '../../../src/core';

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

describe('CreateTaskUseCase', () => {
  let usecase: CreateTaskUseCase;
  let mockRepository: MockTaskRepository;

  beforeEach(() => {
    mockRepository = new MockTaskRepository();
    usecase = new CreateTaskUseCase(mockRepository);
  });

  it('should create a task successfully', async () => {
    const input = {
      title: 'Learn TypeScript',
      description: 'Master TypeScript',
      userId: 'user-123',
    };

    jest.spyOn(mockRepository, 'save').mockResolvedValueOnce(undefined);

    const output = await usecase.execute(input);

    expect(output.title).toBe('Learn TypeScript');
    expect(output.description).toBe('Master TypeScript');
    expect(output.completed).toBe(false);
    expect(mockRepository.save).toHaveBeenCalled();
  });

  it('should throw InvalidTaskException when title is empty', async () => {
    const input = {
      title: '',
      description: 'Master TypeScript',
      userId: 'user-123',
    };

    await expect(usecase.execute(input)).rejects.toThrow(
      InvalidTaskException
    );
  });

  it('should throw InvalidTaskException when title is whitespace', async () => {
    const input = {
      title: '   ',
      description: 'Master TypeScript',
      userId: 'user-123',
    };

    await expect(usecase.execute(input)).rejects.toThrow(
      InvalidTaskException
    );
  });

  it('should call repository.save with the created task', async () => {
    const input = {
      title: 'Test Task',
      description: 'Test Description',
      userId: 'user-123',
    };

    const saveSpy = jest.spyOn(mockRepository, 'save');

    await usecase.execute(input);

    expect(saveSpy).toHaveBeenCalledTimes(1);
    expect(saveSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Test Task',
        description: 'Test Description',
        userId: 'user-123',
      })
    );
  });
});
