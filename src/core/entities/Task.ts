export class Task {
  constructor(
    public id: string,
    public title: string,
    public description: string,
    public completed: boolean,
    public userId: string,
    public createdAt: Date,
    public updatedAt: Date
  ) {}

  complete(): void {
    this.completed = true;
    this.updatedAt = new Date();
  }

  update(title: string, description: string): void {
    this.title = title;
    this.description = description;
    this.updatedAt = new Date();
  }

  static create(
    title: string,
    description: string,
    userId: string
  ): Task {
    const id = Math.random().toString(36).substring(7);
    const now = new Date();

    return new Task(id, title, description, false, userId, now, now);
  }
}
