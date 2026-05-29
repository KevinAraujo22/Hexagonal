import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

let authToken = localStorage.getItem('authToken') || '';

export function setAuthToken(token: string) {
  authToken = token;
  localStorage.setItem('authToken', token);
  apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

export function getAuthToken() {
  return authToken;
}

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

if (authToken) {
  apiClient.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export const api = {
  health: async () => {
    const response = await apiClient.get('/health');
    return response.data;
  },

  createTask: async (title: string, description: string) => {
    const response = await apiClient.post<Task>('/tasks', {
      title,
      description,
    });
    return response.data;
  },

  getTasks: async () => {
    const response = await apiClient.get<{ tasks: Task[] }>('/tasks');
    return response.data.tasks;
  },

  getTaskById: async (id: string) => {
    const response = await apiClient.get<Task>(`/tasks/${id}`);
    return response.data;
  },

  updateTask: async (id: string, title: string, description: string) => {
    const response = await apiClient.patch<Task>(`/tasks/${id}`, {
      title,
      description,
    });
    return response.data;
  },

  completeTask: async (id: string) => {
    const response = await apiClient.patch<Task>(`/tasks/${id}/complete`);
    return response.data;
  },

  uncompleteTask: async (id: string) => {
    const response = await apiClient.patch<Task>(`/tasks/${id}/uncomplete`);
    return response.data;
  },

  deleteTask: async (id: string) => {
    await apiClient.delete(`/tasks/${id}`);
  },

  createBulkTasks: async (
    tasks: Array<{ title: string; description?: string }>
  ) => {
    const response = await apiClient.post<{ created: number; taskIds: string[] }>(
      '/tasks/bulk/create',
      { tasks }
    );
    return response.data;
  },
};
