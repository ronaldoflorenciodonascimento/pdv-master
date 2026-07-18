-- Campos de segurança adicionados sem alterar migrations já aplicadas.
ALTER TABLE users ADD COLUMN must_change_password INTEGER NOT NULL DEFAULT 1 CHECK (must_change_password IN (0, 1));
CREATE INDEX idx_users_company_email_active ON users(company_id, email, active);
