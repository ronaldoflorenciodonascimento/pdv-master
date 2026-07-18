# Arquitetura

O PDV Master usa Electron com isolamento de contexto e arquitetura em camadas. O renderer nunca acessa Node.js, o banco SQLite nem repositórios diretamente.

```text
Renderer → Preload/contextBridge → IPCManager → Controller → Service → Repository → DatabaseManager → SQLite
```

## Camadas

- **Renderer:** apresenta a interface e invoca apenas APIs expostas pelo preload.
- **Preload:** ponte mínima e tipada via `contextBridge`.
- **IPCManager:** registra canais, evita handlers duplicados e concentra falhas de comunicação entre processos.
- **Controller:** padroniza respostas `{ success, data, error }`, sem expor detalhes internos ao renderer.
- **Service:** orquestra repositórios; `BaseService` fornece operações reutilizáveis sem regras de módulo.
- **AuthService:** mantém a sessão exclusivamente no processo main e orquestra hash, login, logout e troca de senha.
- **Repository:** encapsula SQL. `BaseRepository` fornece CRUD parametrizado e os específicos concentram consultas por entidade.
- **CompanyService/CompanyRepository:** centralizam a empresa ativa, validação de DTOs e persistência por `upsertCurrent`.
- **DatabaseManager:** singleton da conexão `better-sqlite3`, com WAL, FKs, timeout, queries preparadas e ciclo de vida.
- **TransactionManager:** executa `BEGIN IMMEDIATE`, `COMMIT` e `ROLLBACK`; operações aninhadas usam savepoints.
- **SQLite:** persiste o modelo versionado por migrations.

## Inicialização e erros

1. O processo main registra tratadores globais de exceção.
2. `DatabaseManager` abre uma única conexão e aplica migrations pendentes.
3. `registerIpcHandlers` monta canais técnicos via `IPCManager`.
4. Winston registra exceções em JSON; controllers retornam erros seguros.

## Estrutura relevante

```text
src/main/
├── database/       # conexão, migrations e transações
├── repositories/   # BaseRepository e adaptadores de entidade
├── services/       # BaseService e serviços futuros
├── controllers/    # respostas padronizadas para IPC
├── ipc/            # registro de canais Electron
└── shared/         # erros e logging Winston
tests/database/     # testes de DatabaseManager e MigrationRunner
```
