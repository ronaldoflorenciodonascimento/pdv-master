import Database from 'better-sqlite3';
import { join } from 'node:path';
import { DatabaseError } from '../shared/errors/DatabaseError';
import { Logger } from '../shared/logging/Logger';
import { MigrationRunner } from './MigrationRunner';
import { TransactionManager } from './TransactionManager';

export type SqlValue = string | number | bigint | Buffer | null;
export type SqlParameters = SqlValue[] | Record<string, SqlValue>;

export interface ExecutionResult {
  changes: number;
  lastInsertRowid: number | bigint;
}

/** Mantém a única conexão SQLite da aplicação e centraliza acesso preparado e transações. */
export class DatabaseManager {
  private static instance: DatabaseManager | undefined;
  private connection: Database.Database | undefined;
  private databasePath: string | null = null;
  private transactionManager: TransactionManager | undefined;

  private constructor() {}

  static getInstance(): DatabaseManager {
    DatabaseManager.instance ??= new DatabaseManager();
    return DatabaseManager.instance;
  }

  initialize(userDataPath: string, migrationsPath: string): void {
    if (this.connection) return;

    this.databasePath = join(userDataPath, 'pdv-master.sqlite');
    try {
      this.connection = new Database(this.databasePath);
      this.connection.pragma('journal_mode = WAL');
      this.connection.pragma('foreign_keys = ON');
      this.connection.pragma('busy_timeout = 5000');
      new MigrationRunner().run(this.connection, migrationsPath);
      this.transactionManager = new TransactionManager(this.connection);
      Logger.info('Banco de dados inicializado.', { databasePath: this.databasePath });
    } catch (error) {
      this.connection?.close();
      this.connection = undefined;
      Logger.error('Falha ao inicializar banco de dados.', { error: String(error) });
      throw new DatabaseError('Não foi possível inicializar o banco de dados.', error);
    }
  }

  getDb(): Database.Database {
    if (!this.connection) throw new DatabaseError('Banco de dados ainda não foi inicializado.');
    return this.connection;
  }

  execute(sql: string, parameters: SqlParameters = []): ExecutionResult {
    try {
      const statement = this.getDb().prepare(sql);
      const result = Array.isArray(parameters) ? statement.run(...parameters) : statement.run(parameters);
      return { changes: result.changes, lastInsertRowid: result.lastInsertRowid };
    } catch (error) {
      Logger.error('Falha ao executar comando SQL.', { error: String(error) });
      throw new DatabaseError('Falha ao executar operação no banco de dados.', error);
    }
  }

  queryOne<T>(sql: string, parameters: SqlParameters = []): T | undefined {
    try {
      const statement = this.getDb().prepare(sql);
      return (Array.isArray(parameters) ? statement.get(...parameters) : statement.get(parameters)) as T | undefined;
    } catch (error) {
      Logger.error('Falha ao consultar registro SQL.', { error: String(error) });
      throw new DatabaseError('Falha ao consultar o banco de dados.', error);
    }
  }

  queryAll<T>(sql: string, parameters: SqlParameters = []): T[] {
    try {
      const statement = this.getDb().prepare(sql);
      return (Array.isArray(parameters) ? statement.all(...parameters) : statement.all(parameters)) as T[];
    } catch (error) {
      Logger.error('Falha ao consultar registros SQL.', { error: String(error) });
      throw new DatabaseError('Falha ao consultar o banco de dados.', error);
    }
  }

  transaction<T>(operation: () => T): T {
    if (!this.transactionManager) throw new DatabaseError('Gerenciador de transações não inicializado.');
    return this.transactionManager.run(operation);
  }

  status(): { databaseReady: boolean; databasePath: string | null } {
    return { databaseReady: this.connection !== undefined, databasePath: this.databasePath };
  }

  close(): void {
    this.connection?.close();
    this.connection = undefined;
    this.databasePath = null;
    this.transactionManager = undefined;
  }
}
