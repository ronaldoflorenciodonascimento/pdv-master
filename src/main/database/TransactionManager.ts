import Database from 'better-sqlite3';
import { DatabaseError } from '../shared/errors/DatabaseError';
import { Logger } from '../shared/logging/Logger';

/** Coordena BEGIN, COMMIT e ROLLBACK, com savepoints para chamadas aninhadas. */
export class TransactionManager {
  private depth = 0;

  constructor(private readonly database: Database.Database) {}

  run<T>(operation: () => T): T {
    const isNested = this.depth > 0;
    const savepoint = `pdv_tx_${this.depth}`;
    try {
      if (isNested) this.database.exec(`SAVEPOINT ${savepoint}`);
      else this.database.exec('BEGIN IMMEDIATE');
      this.depth += 1;
      const result = operation();
      this.depth -= 1;
      if (isNested) this.database.exec(`RELEASE SAVEPOINT ${savepoint}`);
      else this.database.exec('COMMIT');
      return result;
    } catch (error) {
      this.depth = Math.max(0, this.depth - 1);
      try {
        if (isNested) this.database.exec(`ROLLBACK TO SAVEPOINT ${savepoint}`);
        else this.database.exec('ROLLBACK');
      } catch (rollbackError) {
        Logger.error('Falha ao reverter transação.', { error: String(rollbackError) });
      }
      Logger.error('Transação SQLite revertida.', { error: String(error) });
      throw error instanceof DatabaseError ? error : new DatabaseError('Transação SQLite revertida.', error);
    }
  }
}
