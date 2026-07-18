import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { DatabaseManager } from '../../src/main/database/DatabaseManager';

const database = DatabaseManager.getInstance();
const temporaryPaths: string[] = [];
afterEach(() => { database.close(); temporaryPaths.splice(0).forEach((path) => rmSync(path, { recursive: true, force: true })); });
function initializeTestDatabase(): void {
  const root = mkdtempSync(join(tmpdir(), 'pdv-manager-'));
  const migrations = join(root, 'migrations');
  mkdirSync(migrations);
  writeFileSync(join(migrations, '001_test.sql'), 'CREATE TABLE ledger (id INTEGER PRIMARY KEY, description TEXT NOT NULL);');
  temporaryPaths.push(root);
  database.initialize(root, migrations);
}
describe('DatabaseManager', () => {
  it('executa consultas preparadas e mantém uma única conexão', () => {
    initializeTestDatabase();
    database.execute('INSERT INTO ledger (description) VALUES (?)', ['entrada']);
    expect(database.queryOne<{ description: string }>('SELECT description FROM ledger WHERE id = ?', [1])).toEqual({ description: 'entrada' });
    expect(database.status().databaseReady).toBe(true);
  });
  it('faz rollback quando a transação falha', () => {
    initializeTestDatabase();
    expect(() => database.transaction(() => { database.execute('INSERT INTO ledger (description) VALUES (?)', ['deve reverter']); throw new Error('falha simulada'); })).toThrow('Transação SQLite revertida.');
    expect(database.queryAll('SELECT * FROM ledger')).toHaveLength(0);
  });
});
