# Autenticação

## Fluxo

```text
Renderer → preload → auth:* IPC → AuthController → AuthService → AuthRepository → SQLite
```

O renderer só recebe o DTO seguro `{ id, companyId, name, email, mustChangePassword }`. `password_hash`, dados internos da sessão e detalhes de persistência nunca cruzam o `contextBridge`.

## Segurança

- Senhas são persistidas exclusivamente como hashes bcrypt com 12 rounds, por `bcryptjs`.
- `bcryptjs` não possui binário nativo, portanto não introduz incompatibilidade de ABI entre Node e Electron.
- A sessão é mantida somente na instância singleton de `AuthService` no processo main; ela termina ao efetuar logout ou encerrar o aplicativo.
- Usuários com `active = 0` não podem iniciar sessão.
- A migration `004_authentication.sql` adiciona `must_change_password`, iniciado como verdadeiro.

## Canais IPC

| Canal | Entrada | Resposta |
| --- | --- | --- |
| `auth:login` | e-mail e senha | usuário seguro autenticado |
| `auth:logout` | — | confirmação |
| `auth:session` | — | sessão segura ou `null` |
| `auth:change-password` | senha atual e nova senha | usuário seguro atualizado |

## Administrador inicial

Quando a contagem de usuários é zero, `AuthService.ensureInitialAdministrator()` cria o administrador inicial. A senha temporária é documentada no README e deve ser alterada obrigatoriamente no primeiro acesso.
