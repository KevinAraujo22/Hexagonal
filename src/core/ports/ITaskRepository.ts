import { Task } from '../entities/Task';

export interface ITaskRepository {
  save(task: Task): Promise<void>;
  findById(id: string): Promise<Task | null>;
  findByUserId(userId: string): Promise<Task[]>;
  update(task: Task): Promise<void>;
  delete(id: string): Promise<void>;
  saveBulk(tasks: Task[]): Promise<void>;
}

