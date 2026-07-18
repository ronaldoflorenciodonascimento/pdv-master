import Database from 'better-sqlite3';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { MigrationRunner } from '../../src/main/database/MigrationRunner';

const temporaryPaths: string[] = [];
afterEach(() => temporaryPaths.splice(0).forEach((path) => rmSync(path, { recursive: true, force: true })));

describe('MigrationRunner', () => {
  it('aplica cada migration somente uma vez e registra sua versão', () => {
    const migrationsPath = mkdtempSync(join(tmpdir(), 'pdv-migrations-'));
    temporaryPaths.push(migrationsPath);
    writeFileSync(join(migrationsPath, '001_create_example.sql'), 'CREATE TABLE example (id INTEGER PRIMARY KEY, name TEXT NOT NULL);');
    const database = new Database(':memory:');
    const runner = new MigrationRunner();
    runner.run(database, migrationsPath);
    runner.run(database, migrationsPath);
    expect(database.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'example'").get()).toBeTruthy();
    expect(database.prepare('SELECT COUNT(*) AS total FROM schema_migrations').get()).toEqual({ total: 1 });
    database.close();
  });
});
