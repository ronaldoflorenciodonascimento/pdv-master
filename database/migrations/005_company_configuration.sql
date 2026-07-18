ALTER TABLE companies ADD COLUMN uuid TEXT;
ALTER TABLE companies ADD COLUMN municipal_registration TEXT;
ALTER TABLE companies ADD COLUMN country TEXT NOT NULL DEFAULT 'BR';
ALTER TABLE companies ADD COLUMN logo_path TEXT;
ALTER TABLE companies ADD COLUMN currency TEXT NOT NULL DEFAULT 'BRL';
ALTER TABLE companies ADD COLUMN timezone TEXT NOT NULL DEFAULT 'America/Sao_Paulo';
ALTER TABLE companies ADD COLUMN backup_path TEXT;
CREATE UNIQUE INDEX idx_companies_uuid ON companies(uuid) WHERE uuid IS NOT NULL;
CREATE UNIQUE INDEX idx_companies_single_active ON companies(active) WHERE active = 1;
