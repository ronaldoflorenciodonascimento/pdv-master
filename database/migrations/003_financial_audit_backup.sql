-- Financeiro, contas bancárias, auditoria e catálogo de backups.
CREATE TABLE bank_accounts (
  id INTEGER PRIMARY KEY,
  company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  bank_name TEXT NOT NULL,
  bank_code TEXT,
  agency TEXT,
  account_number TEXT NOT NULL,
  account_digit TEXT,
  account_type TEXT NOT NULL DEFAULT 'CHECKING' CHECK (account_type IN ('CHECKING', 'SAVINGS', 'CASH')),
  initial_balance_cents INTEGER NOT NULL DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (company_id, bank_code, agency, account_number)
);

CREATE TABLE accounts_payable (
  id INTEGER PRIMARY KEY,
  company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE RESTRICT,
  supplier_id INTEGER REFERENCES suppliers(id) ON DELETE RESTRICT,
  purchase_id INTEGER REFERENCES purchases(id) ON DELETE RESTRICT,
  bank_account_id INTEGER REFERENCES bank_accounts(id) ON DELETE RESTRICT,
  description TEXT NOT NULL,
  document_number TEXT,
  issue_date TEXT NOT NULL,
  due_date TEXT NOT NULL,
  amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
  paid_amount_cents INTEGER NOT NULL DEFAULT 0 CHECK (paid_amount_cents >= 0 AND paid_amount_cents <= amount_cents),
  status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'PARTIALLY_PAID', 'PAID', 'CANCELLED')),
  paid_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE accounts_receivable (
  id INTEGER PRIMARY KEY,
  company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE RESTRICT,
  customer_id INTEGER REFERENCES customers(id) ON DELETE RESTRICT,
  sale_id INTEGER REFERENCES sales(id) ON DELETE RESTRICT,
  bank_account_id INTEGER REFERENCES bank_accounts(id) ON DELETE RESTRICT,
  description TEXT NOT NULL,
  document_number TEXT,
  issue_date TEXT NOT NULL,
  due_date TEXT NOT NULL,
  amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
  received_amount_cents INTEGER NOT NULL DEFAULT 0 CHECK (received_amount_cents >= 0 AND received_amount_cents <= amount_cents),
  status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'PARTIALLY_RECEIVED', 'RECEIVED', 'CANCELLED')),
  received_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE accounts_payable_payments (
  id INTEGER PRIMARY KEY,
  account_payable_id INTEGER NOT NULL REFERENCES accounts_payable(id) ON DELETE CASCADE,
  payment_method_id INTEGER REFERENCES payment_methods(id) ON DELETE RESTRICT,
  bank_account_id INTEGER REFERENCES bank_accounts(id) ON DELETE RESTRICT,
  amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
  paid_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  notes TEXT
);

CREATE TABLE accounts_receivable_receipts (
  id INTEGER PRIMARY KEY,
  account_receivable_id INTEGER NOT NULL REFERENCES accounts_receivable(id) ON DELETE CASCADE,
  payment_method_id INTEGER REFERENCES payment_methods(id) ON DELETE RESTRICT,
  bank_account_id INTEGER REFERENCES bank_accounts(id) ON DELETE RESTRICT,
  amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
  received_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  notes TEXT
);

CREATE TABLE audit_logs (
  id INTEGER PRIMARY KEY,
  company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE RESTRICT,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  entity_name TEXT NOT NULL,
  entity_id INTEGER,
  action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'EXPORT', 'BACKUP', 'RESTORE')),
  previous_data TEXT CHECK (previous_data IS NULL OR json_valid(previous_data)),
  current_data TEXT CHECK (current_data IS NULL OR json_valid(current_data)),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE backups (
  id INTEGER PRIMARY KEY,
  company_id INTEGER REFERENCES companies(id) ON DELETE SET NULL,
  created_by_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  checksum TEXT NOT NULL,
  size_bytes INTEGER NOT NULL CHECK (size_bytes >= 0),
  backup_type TEXT NOT NULL CHECK (backup_type IN ('MANUAL', 'SCHEDULED', 'PRE_UPDATE')),
  status TEXT NOT NULL DEFAULT 'COMPLETED' CHECK (status IN ('STARTED', 'COMPLETED', 'FAILED')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at TEXT
);

CREATE INDEX idx_bank_accounts_company_active ON bank_accounts(company_id, active);
CREATE INDEX idx_payable_company_due_status ON accounts_payable(company_id, due_date, status);
CREATE INDEX idx_payable_supplier ON accounts_payable(supplier_id);
CREATE INDEX idx_receivable_company_due_status ON accounts_receivable(company_id, due_date, status);
CREATE INDEX idx_receivable_customer ON accounts_receivable(customer_id);
CREATE INDEX idx_audit_company_entity_date ON audit_logs(company_id, entity_name, entity_id, created_at);
CREATE INDEX idx_backups_company_date ON backups(company_id, created_at);
