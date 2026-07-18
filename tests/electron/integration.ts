import assert from 'node:assert/strict';
import Database from 'better-sqlite3';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseManager } from '../../src/main/database/DatabaseManager';
import { MigrationRunner } from '../../src/main/database/MigrationRunner';

const temporaryPaths: string[] = [];
const databaseManager = DatabaseManager.getInstance();

function createMigrationDirectory(): { root: string; migrations: string } {
  const root = mkdtempSync(join(tmpdir(), 'pdv-electron-test-'));
  const migrations = join(root, 'migrations');
  mkdirSync(migrations);
  writeFileSync(join(migrations, '001_ledger.sql'), 'CREATE TABLE ledger (id INTEGER PRIMARY KEY, description TEXT NOT NULL);');
  temporaryPaths.push(root);
  return { root, migrations };
}

function testMigrationRunner(): void {
  const { migrations } = createMigrationDirectory();
  const database = new Database(':memory:');
  const runner = new MigrationRunner();
  runner.run(database, migrations);
  runner.run(database, migrations);
  assert.equal(database.prepare('SELECT COUNT(*) AS total FROM schema_migrations').get().total, 1);
  assert.ok(database.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'ledger'").get());
  database.close();
}

function testDatabaseManager(): void {
  const { root, migrations } = createMigrationDirectory();
  databaseManager.initialize(root, migrations);
  databaseManager.execute('INSERT INTO ledger (description) VALUES (?)', ['entrada']);
  assert.equal(databaseManager.queryOne<{ description: string }>('SELECT description FROM ledger WHERE id = ?', [1])?.description, 'entrada');
  assert.throws(() => databaseManager.transaction(() => {
    databaseManager.execute('INSERT INTO ledger (description) VALUES (?)', ['reverter']);
    throw new Error('falha simulada');
  }));
  assert.equal(databaseManager.queryAll('SELECT * FROM ledger').length, 1);
  databaseManager.close();
}

let exitCode = 0;
try {
  testMigrationRunner();
  testDatabaseManager();
  console.info('Integração SQLite no runtime Electron: aprovada.');
} catch (error) {
  databaseManager.close();
  console.error('Integração SQLite no runtime Electron: falhou.', error);
  exitCode = 1;
} finally {
  temporaryPaths.forEach((path) => rmSync(path, { recursive: true, force: true }));
}
process.exit(exitCode);
