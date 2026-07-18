# PDV Master

Base inicial de um ERP desktop para pequenas empresas. Esta etapa entrega a fundação técnica; regras de negócio ainda não foram implementadas.

## Tecnologias

- Electron + TypeScript
- better-sqlite3 (SQLite local)
- electron-vite e Electron Builder
- ESLint + Prettier

## Pré-requisitos

- Node.js 20 ou superior
- Ferramentas de compilação C++ compatíveis com a plataforma, caso o `better-sqlite3` precise ser compilado localmente

## Instalação e execução

```bash
npm install
npm run dev
```

## Scripts

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Recompila módulos nativos para Electron e executa o app. |
| `npm run build` | Recompila módulos nativos para Electron e compila o app. |
| `npm run dist` | Gera o instalador Windows em `installer/`. |
| `npm test` / `npm run test:electron` | Executa integração SQLite dentro do runtime Electron, sem trocar ABI. |
| `npm run test:node` | Compatibilidade: recompila para Node, roda Vitest e restaura Electron ao final. |
| `npm run rebuild:electron` | Recompila módulos nativos para o runtime do Electron. |
| `npm run validate` | Executa testes, lint e build em sequência. |
| `npm run lint` | Verifica a qualidade do código. |
| `npm run format` | Formata o projeto. |
| `npm test` | Executa testes. |

## Arquitetura

```text
src/
├── main/          # Processo principal e infraestrutura MVC
│   ├── controllers/
│   └── database/
├── preload/       # Ponte segura com contextBridge
└── renderer/      # Interface do usuário
database/          # Scripts e documentação de banco futuros
assets/            # Ícones e recursos de empacotamento
docs/              # Documentação técnica
tests/             # Testes automatizados
```

Na primeira execução, o banco é criado automaticamente em `userData/pdv-master.sqlite`, com WAL e chaves estrangeiras habilitados.

## Primeiro acesso

Somente quando não existir nenhum usuário, o processo main cria o administrador inicial:

- E-mail: `admin@pdvmaster.local`
- Senha temporária: `PDVMaster!2026`

A troca da senha é obrigatória no primeiro login. Essas credenciais não são distribuídas ao renderer e devem ser alteradas imediatamente.

## Configuração da empresa

Após autenticar, abra **Configurações → Dados da empresa** para salvar identificação, contato, endereço e preferências de moeda/fuso/backup. Documento, CEP e telefone são normalizados automaticamente. Consulte `docs/COMPANY_CONFIGURATION.md` para detalhes.

## Cadastros

Categorias e Produtos possuem APIs IPC autenticadas e persistência SQLite. Consulte `docs/CATEGORIES.md` e `docs/PRODUCTS.md`.
