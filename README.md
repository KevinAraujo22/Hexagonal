# Gerenciador de Tarefas — Arquitetura Hexagonal

Aplicação de gerenciamento de tarefas construída com TypeScript e Arquitetura Hexagonal

- **Linguagem:** TypeScript (Strict Mode)
- **Backend:** Express
- **Frontend:** React + Vite
- **Banco de Dados:** MongoDB + Mongoose
- **Testes:** Jest + Supertest

## Setup

### Pré-requisitos

- Node.js 18+
- MongoDB rodando localmente 

### Instalação

```bash
npm install
```

### MongoDB

**Opção A — Local:**
```bash
mongod
```

**Opção B — Docker (recomendado):**
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### Variáveis de ambiente

Crie um arquivo `.env` na raiz com:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/task-management
JWT_SECRET=sua-chave-secreta
NODE_ENV=development
```

### Executar em desenvolvimento

Na pasta raiz para rodar o backend, e na pasta `frontend` para rodar o site:

```bash
npm run dev
```

### Build para produção

```bash
npm run build
node dist/index.js
```

### Gerar token JWT de teste

```bash
npm run generate-token
```

## Testes

Os UseCases são testados com **mocks** no lugar de conectar ao banco real. Isso porque o que queremos testar é a lógica de negócio(validação, autorização, regras) e não se o MongoDB salva corretamente. Com mocks os testes rodam rápido e de forma isolada. O Controller é testado via **Supertest**, que simula requisições HTTP reais sem precisar subir o servidor.

```bash
npm test                
npm test -- --coverage  # Relatório de cobertura
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

## Endpoints da API

Todas as rotas requerem autenticação JWT (`Authorization: Bearer <token>`).

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
│   │   └── models/
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
