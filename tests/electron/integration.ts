import assert from 'node:assert/strict';
import Database from 'better-sqlite3';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseManager } from '../../src/main/database/DatabaseManager';
import { MigrationRunner } from '../../src/main/database/MigrationRunner';
import { AuthService } from '../../src/main/services/AuthService';
import { CompanyRepository } from '../../src/main/repositories/CompanyRepository';
import { CompanyService } from '../../src/main/services/CompanyService';
import { CompanyController } from '../../src/main/controllers/CompanyController';

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

async function testAuthentication(): Promise<void> {
  const root = mkdtempSync(join(tmpdir(), 'pdv-auth-test-'));
  temporaryPaths.push(root);
  databaseManager.initialize(root, join(process.cwd(), 'database', 'migrations'));
  const auth = AuthService.getInstance();
  await auth.ensureInitialAdministrator();
  await assert.rejects(() => auth.login({ email: 'nobody@pdvmaster.local', password: 'qualquer-senha' }));
  await assert.rejects(() => auth.login({ email: 'admin@pdvmaster.local', password: 'senha-incorreta' }));
  const initial = await auth.login({ email: 'admin@pdvmaster.local', password: 'PDVMaster!2026' });
  assert.equal(initial.mustChangePassword, true);
  const changed = await auth.changePassword({ currentPassword: 'PDVMaster!2026', newPassword: 'NovaSenha!2026' });
  assert.equal(changed.mustChangePassword, false);
  assert.ok(auth.currentSession());
  auth.logout();
  assert.equal(auth.currentSession(), null);
  await auth.login({ email: 'admin@pdvmaster.local', password: 'NovaSenha!2026' });
  databaseManager.execute('UPDATE users SET active = 0 WHERE email = ?', ['admin@pdvmaster.local']);
  auth.logout();
  await assert.rejects(() => auth.login({ email: 'admin@pdvmaster.local', password: 'NovaSenha!2026' }));
  databaseManager.close();
}

async function testCompanyConfiguration(): Promise<void> {
  const root = mkdtempSync(join(tmpdir(), 'pdv-company-test-'));
  temporaryPaths.push(root);
  databaseManager.initialize(root, join(process.cwd(), 'database', 'migrations'));
  const repository = new CompanyRepository();
  assert.equal(repository.findCurrent(), null);
  assert.equal(new CompanyController().get().success, false);
  const auth = AuthService.getInstance();
  await auth.ensureInitialAdministrator();
  await auth.login({ email: 'admin@pdvmaster.local', password: 'PDVMaster!2026' });
  const service = new CompanyService();
  const created = service.saveCompany({ legalName: 'Empresa Teste LTDA', tradeName: 'Empresa Teste', document: '12.345.678/0001-90', postalCode: '12.345-678', phone: '(11) 99999-8888', state: 'sp' });
  assert.equal(created.document, '12345678000190'); assert.equal(created.postalCode, '12345678'); assert.equal(created.phone, '11999998888'); assert.equal(created.state, 'SP');
  service.saveCompany({ legalName: 'Empresa Atualizada LTDA', tradeName: 'Empresa Atualizada', document: created.document ?? undefined, postalCode: created.postalCode ?? undefined, phone: created.phone ?? undefined, state: created.state ?? undefined });
  assert.equal(service.getCompany()?.tradeName, 'Empresa Atualizada');
  assert.throws(() => service.saveCompany({ legalName: '', tradeName: 'Teste' }));
  assert.throws(() => service.saveCompany({ legalName: 'Teste', tradeName: '' }));
  assert.throws(() => service.saveCompany({ legalName: 'Teste', tradeName: 'Teste', state: 'São Paulo' }));
  databaseManager.close(); auth.logout();
}

void (async () => {
  let exitCode = 0;
  try {
    testMigrationRunner();
    testDatabaseManager();
    await testAuthentication();
    await testCompanyConfiguration();
    console.info('Integração SQLite no runtime Electron: aprovada.');
  } catch (error) {
    databaseManager.close();
    console.error('Integração SQLite no runtime Electron: falhou.', error);
    exitCode = 1;
  } finally {
    temporaryPaths.forEach((path) => rmSync(path, { recursive: true, force: true }));
  }
  process.exit(exitCode);
})();
