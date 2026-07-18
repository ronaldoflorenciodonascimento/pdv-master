-- Compras, vendas, estoque e caixa.
CREATE TABLE payment_methods (
  id INTEGER PRIMARY KEY,
  company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  method_type TEXT NOT NULL CHECK (method_type IN ('CASH', 'CREDIT_CARD', 'DEBIT_CARD', 'PIX', 'BANK_TRANSFER', 'STORE_CREDIT', 'OTHER')),
  installments_allowed INTEGER NOT NULL DEFAULT 0 CHECK (installments_allowed IN (0, 1)),
  maximum_installments INTEGER NOT NULL DEFAULT 1 CHECK (maximum_installments >= 1),
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (company_id, name)
);

CREATE TABLE purchases (
  id INTEGER PRIMARY KEY,
  company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE RESTRICT,
  supplier_id INTEGER NOT NULL REFERENCES suppliers(id) ON DELETE RESTRICT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  invoice_number TEXT,
  status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'CONFIRMED', 'CANCELLED')),
  purchased_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  subtotal_cents INTEGER NOT NULL DEFAULT 0 CHECK (subtotal_cents >= 0),
  discount_cents INTEGER NOT NULL DEFAULT 0 CHECK (discount_cents >= 0),
  freight_cents INTEGER NOT NULL DEFAULT 0 CHECK (freight_cents >= 0),
  total_cents INTEGER NOT NULL DEFAULT 0 CHECK (total_cents >= 0),
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (company_id, supplier_id, invoice_number)
);

CREATE TABLE purchase_items (
  id INTEGER PRIMARY KEY,
  purchase_id INTEGER NOT NULL REFERENCES purchases(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity_milliunits INTEGER NOT NULL CHECK (quantity_milliunits > 0),
  unit_cost_cents INTEGER NOT NULL CHECK (unit_cost_cents >= 0),
  discount_cents INTEGER NOT NULL DEFAULT 0 CHECK (discount_cents >= 0),
  total_cents INTEGER NOT NULL CHECK (total_cents >= 0),
  UNIQUE (purchase_id, product_id)
);

CREATE TABLE cash_registers (
  id INTEGER PRIMARY KEY,
  company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE RESTRICT,
  opened_by_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  closed_by_user_id INTEGER REFERENCES users(id) ON DELETE RESTRICT,
  status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'CLOSED')),
  opened_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  closed_at TEXT,
  opening_amount_cents INTEGER NOT NULL DEFAULT 0 CHECK (opening_amount_cents >= 0),
  closing_amount_cents INTEGER CHECK (closing_amount_cents >= 0),
  notes TEXT,
  CHECK ((status = 'OPEN' AND closed_at IS NULL) OR (status = 'CLOSED' AND closed_at IS NOT NULL))
);

CREATE TABLE sales (
  id INTEGER PRIMARY KEY,
  company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE RESTRICT,
  customer_id INTEGER REFERENCES customers(id) ON DELETE RESTRICT,
  cash_register_id INTEGER REFERENCES cash_registers(id) ON DELETE RESTRICT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'COMPLETED', 'CANCELLED')),
  sold_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  subtotal_cents INTEGER NOT NULL DEFAULT 0 CHECK (subtotal_cents >= 0),
  discount_cents INTEGER NOT NULL DEFAULT 0 CHECK (discount_cents >= 0),
  total_cents INTEGER NOT NULL DEFAULT 0 CHECK (total_cents >= 0),
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sale_items (
  id INTEGER PRIMARY KEY,
  sale_id INTEGER NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity_milliunits INTEGER NOT NULL CHECK (quantity_milliunits > 0),
  unit_price_cents INTEGER NOT NULL CHECK (unit_price_cents >= 0),
  discount_cents INTEGER NOT NULL DEFAULT 0 CHECK (discount_cents >= 0),
  total_cents INTEGER NOT NULL CHECK (total_cents >= 0),
  UNIQUE (sale_id, product_id)
);

CREATE TABLE sale_payments (
  id INTEGER PRIMARY KEY,
  sale_id INTEGER NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  payment_method_id INTEGER NOT NULL REFERENCES payment_methods(id) ON DELETE RESTRICT,
  installment_number INTEGER NOT NULL DEFAULT 1 CHECK (installment_number >= 1),
  amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
  authorization_code TEXT,
  paid_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE inventory_movements (
  id INTEGER PRIMARY KEY,
  company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE RESTRICT,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  user_id INTEGER REFERENCES users(id) ON DELETE RESTRICT,
  movement_type TEXT NOT NULL CHECK (movement_type IN ('PURCHASE', 'SALE', 'RETURN_IN', 'RETURN_OUT', 'ADJUSTMENT_IN', 'ADJUSTMENT_OUT', 'LOSS')),
  quantity_milliunits INTEGER NOT NULL CHECK (quantity_milliunits <> 0),
  unit_cost_cents INTEGER CHECK (unit_cost_cents >= 0),
  purchase_item_id INTEGER REFERENCES purchase_items(id) ON DELETE RESTRICT,
  sale_item_id INTEGER REFERENCES sale_items(id) ON DELETE RESTRICT,
  occurred_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,
  CHECK (NOT (purchase_item_id IS NOT NULL AND sale_item_id IS NOT NULL))
);

CREATE TABLE cash_movements (
  id INTEGER PRIMARY KEY,
  cash_register_id INTEGER NOT NULL REFERENCES cash_registers(id) ON DELETE RESTRICT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  payment_method_id INTEGER REFERENCES payment_methods(id) ON DELETE RESTRICT,
  movement_type TEXT NOT NULL CHECK (movement_type IN ('OPENING', 'SALE', 'WITHDRAWAL', 'DEPOSIT', 'REFUND', 'CLOSING_ADJUSTMENT')),
  amount_cents INTEGER NOT NULL CHECK (amount_cents <> 0),
  sale_payment_id INTEGER REFERENCES sale_payments(id) ON DELETE RESTRICT,
  occurred_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  notes TEXT
);

CREATE INDEX idx_purchases_company_date ON purchases(company_id, purchased_at);
CREATE INDEX idx_purchases_supplier ON purchases(supplier_id, status);
CREATE INDEX idx_purchase_items_product ON purchase_items(product_id);
CREATE INDEX idx_sales_company_date ON sales(company_id, sold_at);
CREATE INDEX idx_sales_customer ON sales(customer_id, status);
CREATE INDEX idx_sale_items_product ON sale_items(product_id);
CREATE INDEX idx_inventory_product_date ON inventory_movements(product_id, occurred_at);
CREATE INDEX idx_cash_register_company_status ON cash_registers(company_id, status);
CREATE INDEX idx_cash_movements_register_date ON cash_movements(cash_register_id, occurred_at);
