# Banco de dados — PDV Master

## Princípios de projeto

O banco usa SQLite com `foreign_keys = ON`, modo WAL e migrations SQL imutáveis. Valores monetários são armazenados como inteiros em centavos (`*_cents`) e quantidades como milésimos de unidade (`*_milliunits`), evitando perda de precisão inclusive em produtos fracionados. Datas são armazenadas em UTC no formato ISO-8601 aceito pelo SQLite. Dados de domínio são normalizados até a 3FN: relações muitos-para-muitos usam tabelas associativas, e valores repetidos de meios de pagamento, perfis e fornecedores não são duplicados nas operações.

Cada tabela de negócio pertence a uma empresa por `company_id`. O processo de aplicação deve assegurar que todas as chaves de uma mesma operação pertençam à mesma empresa; as FKs garantem a existência dos registros e as operações de exclusão preservam o histórico com `RESTRICT` quando necessário.

## Migrations

| Versão | Arquivo | Escopo |
| --- | --- | --- |
| 001 | `database/migrations/001_identity_catalog.sql` | Empresa, usuários, segurança e cadastros mestres. |
| 002 | `database/migrations/002_commercial_inventory_cash.sql` | Compras, vendas, estoque, caixa e pagamentos de venda. |
| 003 | `database/migrations/003_financial_audit_backup.sql` | Bancos, contas financeiras, auditoria e backups. |

Na inicialização, `MigrationRunner` cria `schema_migrations` e aplica, em ordem lexicográfica, somente as migrations ainda não registradas. Uma migration já aplicada não deve ser alterada; evoluções futuras devem usar uma nova versão (`004_...sql`).

## Entidades e relacionamentos

```text
companies 1──N users ──N user_profiles N──1 profiles ──N profile_permissions N──1 permissions
companies 1──N categories (hierarquia por parent_id)
companies 1──N products N──N suppliers (product_suppliers)
companies 1──N customers

suppliers 1──N purchases 1──N purchase_items N──1 products
customers 1──N sales 1──N sale_items N──1 products
sales 1──N sale_payments N──1 payment_methods

products 1──N inventory_movements
cash_registers 1──N cash_movements
companies 1──N bank_accounts
suppliers 1──N accounts_payable 1──N accounts_payable_payments
customers 1──N accounts_receivable 1──N accounts_receivable_receipts
companies 1──N audit_logs
companies 1──N backups
```

### Segurança e configuração

- `companies`: tenant, dados cadastrais e endereço da empresa.
- `users`: credencial identificada por e-mail único dentro da empresa; apenas `password_hash` é persistido.
- `profiles`, `permissions`, `profile_permissions` e `user_profiles`: RBAC normalizado. Um usuário pode ter vários perfis; um perfil pode conceder várias permissões.
- `settings`: par chave/valor por empresa, com tipo explícito para configurações flexíveis sem desnormalizar outras entidades.

### Cadastros e estoque

- `categories`: árvore de categorias autorrreferenciada por `parent_id`.
- `products`: SKU e código de barras únicos por empresa, preço/custo em centavos e limites de estoque.
- `suppliers` e `customers`: pessoas jurídicas/físicas e seus contatos/endereço.
- `product_suppliers`: elimina repetição e permite vários fornecedores por produto.
- `inventory_movements`: livro razão de estoque. Cada linha representa entrada ou saída, com referências opcionais e exclusivas a item de compra ou venda. O saldo deve ser calculado pela soma das movimentações, preservando rastreabilidade.

### Comercial e caixa

- `purchases`/`purchase_items`: cabeçalho e itens de compra; totais são valores persistidos para o retrato do documento, nunca substitutos dos itens.
- `sales`/`sale_items`: mesma estrutura para vendas; cliente e caixa podem ser opcionais no rascunho.
- `payment_methods` e `sale_payments`: uma venda pode ter múltiplas formas de pagamento e parcelas.
- `cash_registers`: sessões de abertura/fechamento de caixa, com estados restritos por `CHECK`.
- `cash_movements`: entradas e saídas do caixa, vinculáveis a um pagamento de venda.

### Financeiro, auditoria e backup

- `bank_accounts`: contas bancárias, inclusive uma conta do tipo `CASH` quando aplicável.
- `accounts_payable` e `accounts_receivable`: títulos a pagar/receber; podem apontar à compra ou venda que os originou, sem dependência polimórfica.
- `accounts_payable_payments` e `accounts_receivable_receipts`: baixas parciais normalizadas; os campos acumulados no título permitem consulta rápida e são validados por `CHECK` para nunca superar o valor original.
- `audit_logs`: trilha de auditoria com snapshots JSON validados por `json_valid`.
- `backups`: catálogo de artefatos de backup, checksum, tamanho, tipo, estado e responsável; o arquivo físico não é gravado nesta tabela.

## Integridade e desempenho

As FKs usam `CASCADE` apenas para dependentes sem valor histórico independente, como itens de uma operação ainda removível, associações de perfil e configurações. Histórico comercial, financeiro e de estoque usa `RESTRICT`, bloqueando exclusões que comprometeriam a rastreabilidade. `CHECK` restringe estados, tipos, valores monetários e quantidades inválidas. Os índices cobrem as consultas operacionais usuais: empresa/data, vencimento/status, produto/data, caixa/data, nome e relações de item.

## Convenções para próximas migrations

1. Criar arquivo com prefixo sequencial de três dígitos em `database/migrations/`.
2. Usar `INTEGER PRIMARY KEY` como chave substituta e FKs explícitas.
3. Usar valores monetários inteiros em centavos e não `REAL`.
4. Adicionar índices para toda FK usada em filtros ou joins frequentes.
5. Preferir novas tabelas associativas para relações N:N e evitar colunas JSON fora de auditoria/configuração.
