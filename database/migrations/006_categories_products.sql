ALTER TABLE categories ADD COLUMN uuid TEXT;
ALTER TABLE categories ADD COLUMN default_margin_percentage INTEGER NOT NULL DEFAULT 0 CHECK (default_margin_percentage BETWEEN 0 AND 100000);
ALTER TABLE products ADD COLUMN uuid TEXT;
ALTER TABLE products ADD COLUMN margin_percentage INTEGER NOT NULL DEFAULT 0 CHECK (margin_percentage BETWEEN 0 AND 100000);
ALTER TABLE products ADD COLUMN current_stock_milli INTEGER NOT NULL DEFAULT 0 CHECK (current_stock_milli >= 0);
CREATE UNIQUE INDEX idx_categories_company_name_nocase ON categories(company_id, name COLLATE NOCASE);
CREATE UNIQUE INDEX idx_products_company_sku_nocase ON products(company_id, sku COLLATE NOCASE);
CREATE INDEX idx_products_company_active_category ON products(company_id, active, category_id);
