# Configuração da Empresa

O módulo mantém uma única empresa ativa e segue o fluxo `Renderer → IPC → Controller → Service → Repository → SQLite`.

## Dados e segurança

- A migration `005_company_configuration.sql` amplia `companies` sem alterar migrations aplicadas.
- O campo `uuid` prepara a evolução para multiempresa; esta sprint usa somente o registro `active = 1`.
- `CompanyService` normaliza documento, CEP e telefone para dígitos; estado aceita apenas duas letras maiúsculas.
- A pasta de backup aceita apenas caminho relativo sem `..` ou raiz/unidade, evitando caminhos arbitrários.
- Canais `company:get` e `company:save` exigem sessão no processo main. DTOs rejeitam campos inesperados.

## Interface

A opção **Configurações → Dados da empresa** apresenta identificação, contato, endereço e sistema. Logomarca é somente placeholder nesta sprint; não há upload de arquivos nem consulta externa de CNPJ/CEP.
