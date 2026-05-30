# Gerenciador de Tarefas — Arquitetura Hexagonal

Aplicação de gerenciamento de tarefas construída com TypeScript e Arquitetura Hexagonal

- **Linguagem:** TypeScript (Strict Mode)
- **Backend:** Express
- **Frontend:** React + Vite
- **Banco de Dados:** MongoDB + Mongoose
- **Testes:** Jest + Supertest

## Setup

Pré-requisito: ter o [Docker](https://www.docker.com/) instalado.

```bash
docker compose up --build
```

Isso sobe tudo automaticamente: MongoDB, backend e frontend. Não é necessário instalar Node.js, MongoDB ou qualquer outra dependência manualmente.

| Serviço | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend | http://localhost:3000 |

Para parar:
```bash
docker compose down
```

Para parar e apagar os dados do banco:
```bash
docker compose down -v
```

---

## Autenticação

A autenticação é feita com **usuário e senha**. O token JWT é gerado pelo backend e armazenado em um **cookie httpOnly** — o frontend nunca tem acesso direto ao token.

### Criar conta

Acesse http://localhost:5173, clique em **Criar conta**, informe usuário e senha.

### Login

Na mesma tela, clique em **Entrar** e informe suas credenciais.

### Endpoints de autenticação

| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/auth/register` | Criar nova conta `{ username, password }` |
| `POST` | `/auth/login` | Fazer login `{ username, password }` |
| `POST` | `/auth/logout` | Encerrar sessão |
| `GET` | `/auth/check` | Verificar se a sessão está ativa |

As senhas são armazenadas com hash **bcrypt** — nunca em texto puro.

---

## Testes

Os UseCases são testados com **mocks** no lugar de conectar ao banco real. Isso porque o que queremos testar é a lógica de negócio (validação, autorização, regras) e não se o MongoDB salva corretamente. Com mocks os testes rodam rápido e de forma isolada. O Controller é testado via **Supertest**, que simula requisições HTTP reais sem precisar subir o servidor.

```bash
npm test
npm test -- --coverage
```

**Cobertura de testes:**

- `TaskController` — inputs inválidos (Zod → 400), 404, 403, 401 via Supertest
- `authMiddleware` — token ausente, inválido, expirado
- `CreateTaskUseCase` — criação, validação de título
- `GetTaskByIdUseCase` — not found, acesso negado
- `UpdateTaskUseCase` — atualização, autorização
- `DeleteTaskUseCase` — exclusão, autorização
- `CompleteTaskUseCase` — conclusão, autorização
- `UncompleteTaskUseCase` — reversão, autorização
- `CreateBulkTasksUseCase` — lote, limite de 1000, validação

---

## Endpoints da API

Todas as rotas de tarefas requerem autenticação via cookie de sessão.

### Tasks

| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/tasks` | Criar uma tarefa |
| `POST` | `/tasks/bulk/create` | Criar múltiplas tarefas (até 1000) |
| `GET` | `/tasks` | Listar tarefas do usuário autenticado |
| `GET` | `/tasks/:id` | Obter tarefa por ID |
| `PATCH` | `/tasks/:id` | Atualizar título e descrição |
| `PATCH` | `/tasks/:id/complete` | Marcar tarefa como concluída |
| `PATCH` | `/tasks/:id/uncomplete` | Reverter tarefa para pendente |
| `DELETE` | `/tasks/:id` | Deletar tarefa |

### Health

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/health` | Verificar status da API |

---

## Estrutura de Pastas

```
src/
├── core/                        # Núcleo de negócio (sem dependências externas)
│   ├── entities/                # Task.ts
│   ├── ports/                   # ITaskRepository.ts (interfaces)
│   ├── usecases/                # Um arquivo por caso de uso
│   ├── exceptions.ts            # DomainException, TaskNotFoundException, etc.
│   └── index.ts
├── adapters/
│   ├── database/                # Output Adapter: MongooseTaskRepository
│   │   └── models/              # TaskModel.ts, UserModel.ts
│   └── http/                    # Input Adapter: Express
│       ├── controllers/         # TaskController (Zod + mapeamento para DTO)
│       ├── middlewares/         # authMiddleware, globalErrorHandler
│       ├── routes/
│       └── app.ts
└── index.ts

tests/
├── core/usecases/               # Testes de UseCases com mocks
└── adapters/http/
    ├── middlewares/             # Testes de middleware
    └── controllers/             # Testes HTTP com Supertest

frontend/
└── src/                         # React + Vite
```
