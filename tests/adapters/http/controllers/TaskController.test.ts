import request from 'supertest';
import jwt from 'jsonwebtoken';
import { createApp } from '../../../../src/adapters/http/app';
import { ITaskRepository } from '../../../../src/core';
import { Task } from '../../../../src/core';

class MockTaskRepository implements ITaskRepository {
  async save(): Promise<void> {}
  async findById(): Promise<Task | null> { return null; }
  async findByUserId(): Promise<Task[]> { return []; }
  async update(): Promise<void> {}
  async delete(): Promise<void> {}
  async saveBulk(): Promise<void> {}
}

const JWT_SECRET = 'your-secret-key-change-in-production';
const userId = 'user-123';
const validCookie = `token=${jwt.sign({ userId }, JWT_SECRET)}`;

describe('TaskController', () => {
  let mockRepository: MockTaskRepository;
  let app: ReturnType<typeof createApp>;

  beforeEach(() => {
    mockRepository = new MockTaskRepository();
    app = createApp(mockRepository as any);
  });

  describe('POST /tasks', () => {
    it('should return 201 when task is created successfully', async () => {
      jest.spyOn(mockRepository, 'save').mockResolvedValueOnce(undefined);

      const res = await request(app)
        .post('/tasks')
        .set('Cookie', validCookie)
        .send({ title: 'Minha tarefa', description: 'Descrição' });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('title', 'Minha tarefa');
      expect(res.body).toHaveProperty('completed', false);
    });

    it('should return 400 when title is missing (Zod validation)', async () => {
      const res = await request(app)
        .post('/tasks')
        .set('Cookie', validCookie)
        .send({ description: 'Sem título' });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error', 'ValidationError');
    });

    it('should return 400 when title is empty string (Zod validation)', async () => {
      const res = await request(app)
        .post('/tasks')
        .set('Cookie', validCookie)
        .send({ title: '', description: 'Descrição' });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error', 'ValidationError');
    });

    it('should return 401 when no token is provided', async () => {
      const res = await request(app)
        .post('/tasks')
        .send({ title: 'Tarefa', description: 'Descrição' });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /tasks/:id', () => {
    it('should return 404 when task does not exist', async () => {
      jest.spyOn(mockRepository, 'findById').mockResolvedValueOnce(null);

      const res = await request(app)
        .get('/tasks/id-inexistente')
        .set('Cookie', validCookie);

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error', 'TaskNotFoundException');
    });

    it('should return 403 when user is not the task owner', async () => {
      const task = Task.create('Tarefa', 'Descrição', 'outro-usuario');
      jest.spyOn(mockRepository, 'findById').mockResolvedValueOnce(task as any);

      const res = await request(app)
        .get(`/tasks/${task.id}`)
        .set('Cookie', validCookie);

      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty('error', 'UnauthorizedException');
    });

    it('should return 200 with task data when owner requests it', async () => {
      const task = Task.create('Tarefa', 'Descrição', userId);
      jest.spyOn(mockRepository, 'findById').mockResolvedValueOnce(task as any);

      const res = await request(app)
        .get(`/tasks/${task.id}`)
        .set('Cookie', validCookie);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('title', 'Tarefa');
    });
  });

  describe('PATCH /tasks/:id', () => {
    it('should return 400 when update payload has empty title (Zod validation)', async () => {
      const res = await request(app)
        .patch('/tasks/qualquer-id')
        .set('Cookie', validCookie)
        .send({ title: '', description: 'Ok' });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error', 'ValidationError');
    });

    it('should return 404 when task to update does not exist', async () => {
      jest.spyOn(mockRepository, 'findById').mockResolvedValueOnce(null);

      const res = await request(app)
        .patch('/tasks/id-inexistente')
        .set('Cookie', validCookie)
        .send({ title: 'Novo título', description: '' });

      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /tasks/:id', () => {
    it('should return 204 when task is deleted successfully', async () => {
      const task = Task.create('Tarefa', 'Descrição', userId);
      jest.spyOn(mockRepository, 'findById').mockResolvedValueOnce(task as any);
      jest.spyOn(mockRepository, 'delete').mockResolvedValueOnce(undefined);

      const res = await request(app)
        .delete(`/tasks/${task.id}`)
        .set('Cookie', validCookie);

      expect(res.status).toBe(204);
    });

    it('should return 403 when user tries to delete another user task', async () => {
      const task = Task.create('Tarefa', 'Descrição', 'outro-usuario');
      jest.spyOn(mockRepository, 'findById').mockResolvedValueOnce(task as any);

      const res = await request(app)
        .delete(`/tasks/${task.id}`)
        .set('Cookie', validCookie);

      expect(res.status).toBe(403);
    });
  });

  describe('POST /tasks/bulk/create', () => {
    it('should return 400 when tasks array is empty (Zod validation)', async () => {
      const res = await request(app)
        .post('/tasks/bulk/create')
        .set('Cookie', validCookie)
        .send({ tasks: [] });

      expect(res.status).toBe(400);
    });

    it('should return 201 with created count', async () => {
      jest.spyOn(mockRepository, 'saveBulk').mockResolvedValueOnce(undefined);

      const res = await request(app)
        .post('/tasks/bulk/create')
        .set('Cookie', validCookie)
        .send({ tasks: [{ title: 'A' }, { title: 'B' }] });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('created', 2);
    });
  });
});
