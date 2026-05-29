import { useState, useEffect } from 'react';
import { api, Task, setAuthToken, getAuthToken } from './api';
import './App.css';

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [token, setToken] = useState(getAuthToken());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');

  useEffect(() => {
    if (token) {
      loadTasks();
    }
  }, [token]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getTasks();
      setTasks(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao carregar tarefas');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (testToken: string) => {
    setAuthToken(testToken);
    setToken(testToken);
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Digite um título');
      return;
    }

    try {
      setError(null);
      const newTask = await api.createTask(title, description);
      setTasks([...tasks, newTask]);
      setTitle('');
      setDescription('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao criar tarefa');
    }
  };

  const handleToggleComplete = async (task: Task) => {
    try {
      setError(null);
      const updated = task.completed
        ? await api.uncompleteTask(task.id)
        : await api.completeTask(task.id);
      setTasks(tasks.map((t) => (t.id === task.id ? { ...t, ...updated } : t)));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao atualizar tarefa');
    }
  };

  const handleStartEdit = (task: Task) => {
    setEditingId(task.id);
    setEditTitle(task.title);
    setEditDescription(task.description || '');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
    setEditDescription('');
  };

  const handleSaveEdit = async (id: string) => {
    if (!editTitle.trim()) {
      setError('O título não pode ser vazio');
      return;
    }
    try {
      setError(null);
      const updated = await api.updateTask(id, editTitle, editDescription);
      setTasks(tasks.map((t) => (t.id === id ? { ...t, ...updated } : t)));
      handleCancelEdit();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao editar tarefa');
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      setError(null);
      await api.deleteTask(id);
      setTasks(tasks.filter((t) => t.id !== id));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao deletar tarefa');
    }
  };

  const handleLogout = () => {
    setAuthToken('');
    setToken('');
    setTasks([]);
    setTitle('');
    setDescription('');
  };

  if (!token) {
    return (
      <div className="app">
        <div className="login-container">
          <div className="login-box">
            <h1>📝 Gerenciador de Tarefas</h1>
            <p>Gerenciador de Tarefas com Arquitetura Hexagonal</p>

            <div className="login-instructions">
              <h3>Para testar, você precisa de um token JWT.</h3>

              <div className="step">
                <h4>Gerar Token</h4>
                <p>No terminal (pasta do backend), execute:</p>
                <code>npm run generate-token</code>
              </div>

              <div className="step">
                <h4>Cole aqui</h4>
                <textarea
                  placeholder="Cole o token JWT aqui..."
                  onChange={(e) => {
                    const testToken = e.currentTarget.value.trim();
                    if (testToken) {
                      handleLogin(testToken);
                    }
                  }}
                  style={{ width: '100%', height: '100px', marginTop: '10px' }}
                />
              </div>

              <div className="demo-token">
                <p>Ou use um token de teste rápido:</p>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    const demoToken =
                      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ0ZXN0LXVzZXItMTIzIiwiaWF0IjoxNzc5OTgwNzQyfQ.FKOZR2LE94VdqBQz8LQW6m4YP5VaPY3qZ3lgM8l1hZ8';
                    handleLogin(demoToken);
                  }}
                >
                  Usar Token Demo
                </button>
                <p style={{ fontSize: '12px', color: '#666' }}>
                  (Funciona se o backend estiver rodando)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="header">
        <h1>Minhas Tarefas</h1>
        <button className="btn btn-danger" onClick={handleLogout}>
          Logout
        </button>
      </header>

      {error && <div className="error-message">{error}</div>}

      <main className="container">
        <section className="create-task">
          <h2>Nova Tarefa</h2>
          <form onSubmit={handleCreateTask}>
            <input
              type="text"
              placeholder="Título da tarefa"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input"
            />
            <textarea
              placeholder="Descrição (opcional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input"
            />
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Criando...' : '➕ Criar Tarefa'}
            </button>
          </form>
        </section>

        <section className="tasks-list">
          <h2>Tarefas ({tasks.length})</h2>

          {loading && <p>Carregando...</p>}

          {tasks.length === 0 && !loading && (
            <p className="empty-message">Nenhuma tarefa. Crie uma acima!</p>
          )}

          <ul className="tasks">
            {tasks.map((task) => (
              <li key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
                {editingId === task.id ? (
                  <div className="task-edit-form">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="input"
                      autoFocus
                    />
                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      className="input"
                      placeholder="Descrição (opcional)"
                    />
                    <div className="task-edit-actions">
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleSaveEdit(task.id)}
                      >
                        Salvar
                      </button>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={handleCancelEdit}
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="task-content">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => handleToggleComplete(task)}
                        className="task-checkbox"
                        title={task.completed ? 'Reverter para pendente' : 'Marcar como concluída'}
                      />
                      <div className="task-info">
                        <h3>{task.title}</h3>
                        {task.description && <p>{task.description}</p>}
                        <small>
                          {task.createdAt
                            ? new Date(task.createdAt).toLocaleDateString('pt-BR')
                            : ''}
                        </small>
                      </div>
                    </div>
                    <div className="task-actions">
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleStartEdit(task)}
                        title="Editar tarefa"
                      >
                        ✏️
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDeleteTask(task.id)}
                        title="Excluir tarefa"
                      >
                        🗑️
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}

export default App;
