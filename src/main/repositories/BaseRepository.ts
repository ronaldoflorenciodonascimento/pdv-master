import { DatabaseManager, SqlParameters, SqlValue } from '../database/DatabaseManager';
import { NotFoundError } from '../shared/errors/DatabaseError';

export type EntityRecord = { id: number } & Record<string, SqlValue | undefined>;
export type CreateData<T> = Omit<T, 'id'>;
export type UpdateData<T> = Partial<Omit<T, 'id'>>;

/** CRUD genérico; nomes de tabela/coluna são validados antes de integrar SQL. */
export abstract class BaseRepository<T extends EntityRecord> {
  protected readonly database = DatabaseManager.getInstance();

  protected constructor(protected readonly tableName: string) {
    this.assertIdentifier(tableName);
  }

  findById(id: number): T | undefined {
    return this.database.queryOne<T>(`SELECT * FROM ${this.tableName} WHERE id = ?`, [id]);
  }

  getById(id: number): T {
    const entity = this.findById(id);
    if (!entity) throw new NotFoundError(this.tableName, id);
    return entity;
  }

  findAll(limit = 100, offset = 0): T[] {
    return this.database.queryAll<T>(`SELECT * FROM ${this.tableName} ORDER BY id LIMIT ? OFFSET ?`, [limit, offset]);
  }

  findWhere(criteria: Record<string, SqlValue>, limit = 100): T[] {
    const entries = Object.entries(criteria);
    if (entries.length === 0) return this.findAll(limit);
    entries.forEach(([column]) => this.assertIdentifier(column));
    const where = entries.map(([column]) => `${column} = ?`).join(' AND ');
    return this.database.queryAll<T>(`SELECT * FROM ${this.tableName} WHERE ${where} ORDER BY id LIMIT ?`, [
      ...entries.map(([, value]) => value),
      limit,
    ]);
  }

  create(data: CreateData<T>): number {
    const entries = this.entries(data as Record<string, SqlValue | undefined>);
    if (entries.length === 0) throw new Error('Não é possível criar um registro sem dados.');
    const columns = entries.map(([column]) => column).join(', ');
    const placeholders = entries.map(() => '?').join(', ');
    const result = this.database.execute(
      `INSERT INTO ${this.tableName} (${columns}) VALUES (${placeholders})`,
      entries.map(([, value]) => value),
    );
    return Number(result.lastInsertRowid);
  }

  update(id: number, data: UpdateData<T>): boolean {
    const entries = this.entries(data as Record<string, SqlValue | undefined>);
    if (entries.length === 0) return false;
    const assignments = entries.map(([column]) => `${column} = ?`).join(', ');
    const result = this.database.execute(`UPDATE ${this.tableName} SET ${assignments} WHERE id = ?`, [
      ...entries.map(([, value]) => value),
      id,
    ]);
    return result.changes > 0;
  }

  delete(id: number): boolean {
    return this.database.execute(`DELETE FROM ${this.tableName} WHERE id = ?`, [id]).changes > 0;
  }

  protected queryOne<R>(sql: string, parameters: SqlParameters = []): R | undefined {
    return this.database.queryOne<R>(sql, parameters);
  }

  protected queryAll<R>(sql: string, parameters: SqlParameters = []): R[] {
    return this.database.queryAll<R>(sql, parameters);
  }

  private entries(data: Record<string, SqlValue | undefined>): Array<[string, SqlValue]> {
    return Object.entries(data)
      .filter(([, value]) => value !== undefined)
      .map(([column, value]) => {
        this.assertIdentifier(column);
        return [column, value as SqlValue];
      });
  }

  private assertIdentifier(identifier: string): void {
    if (!/^[a-z][a-z0-9_]*$/i.test(identifier)) throw new Error(`Identificador SQL inválido: ${identifier}`);
  }
}
