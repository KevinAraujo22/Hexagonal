import { Task, ITaskRepository } from '../../../core';
import { TaskModel, ITaskDocument } from '../models/TaskModel';

export class MongooseTaskRepository implements ITaskRepository {
  async save(task: Task): Promise<void> {
    const doc = await TaskModel.create({
      title: task.title,
      description: task.description,
      completed: task.completed,
      userId: task.userId,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    });

    task.id = doc._id.toString();
  }

  async findById(id: string): Promise<Task | null> {
    const doc = await TaskModel.findById(id);

    if (!doc) {
      return null;
    }

    return new Task(
      doc._id.toString(),
      doc.title,
      doc.description,
      doc.completed,
      doc.userId,
      doc.createdAt,
      doc.updatedAt
    );
  }

  async findByUserId(userId: string): Promise<Task[]> {
    const docs = await TaskModel.find({ userId });

    return docs.map(
      (doc: ITaskDocument) =>
        new Task(
          doc._id.toString(),
          doc.title,
          doc.description,
          doc.completed,
          doc.userId,
          doc.createdAt,
          doc.updatedAt
        )
    );
  }

  async update(task: Task): Promise<void> {
    await TaskModel.findByIdAndUpdate(task.id, {
      title: task.title,
      description: task.description,
      completed: task.completed,
      updatedAt: task.updatedAt,
    });
  }

  async delete(id: string): Promise<void> {
    await TaskModel.findByIdAndDelete(id);
  }

  async saveBulk(tasks: Task[]): Promise<void> {
    const docs = tasks.map((task) => ({
      title: task.title,
      description: task.description,
      completed: task.completed,
      userId: task.userId,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    }));

    const created = await TaskModel.insertMany(docs);

    tasks.forEach((task, index) => {
      task.id = created[index]._id.toString();
    });
  }
}
