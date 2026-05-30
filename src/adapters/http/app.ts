import express, { Express } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { createTaskRoutes } from './routes/taskRoutes';
import { globalErrorHandler } from './middlewares';
import { ITaskRepository } from '../../core';
import { UserModel } from '../database/models/UserModel';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export function createApp(taskRepository: ITaskRepository): Express {
  const app = express();

  app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
  }));
  app.use(express.json());
  app.use(cookieParser());

  app.post('/auth/register', async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ message: 'Usuário e senha são obrigatórios' });
      }

      const existing = await UserModel.findOne({ username });
      if (existing) {
        return res.status(409).json({ message: 'Nome de usuário já existe' });
      }

      const hashed = await bcrypt.hash(password, 10);
      const user = await UserModel.create({ username, password: hashed });

      const token = jwt.sign({ userId: user._id.toString() }, JWT_SECRET);

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000,
      });

      return res.status(201).json({ message: 'Conta criada com sucesso' });
    } catch (err) {
      return res.status(500).json({ message: 'Erro ao criar conta' });
    }
  });

  app.post('/auth/login', async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ message: 'Usuário e senha são obrigatórios' });
      }

      const user = await UserModel.findOne({ username });
      if (!user) {
        return res.status(401).json({ message: 'Usuário ou senha inválidos' });
      }

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        return res.status(401).json({ message: 'Usuário ou senha inválidos' });
      }

      const token = jwt.sign({ userId: user._id.toString() }, JWT_SECRET);

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000,
      });

      return res.status(200).json({ message: 'Login realizado com sucesso' });
    } catch (err) {
      return res.status(500).json({ message: 'Erro ao fazer login' });
    }
  });

  app.post('/auth/logout', (req, res) => {
    res.clearCookie('token');
    return res.status(200).json({ message: 'Logout realizado' });
  });

  app.get('/auth/check', (req, res) => {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    try {
      jwt.verify(token, JWT_SECRET);
      return res.status(200).json({ message: 'Authenticated' });
    } catch {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
  });

  app.use('/tasks', createTaskRoutes(taskRepository));

  app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  app.use(globalErrorHandler);

  return app;
}
