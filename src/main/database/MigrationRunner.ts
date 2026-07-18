import Database from 'better-sqlite3';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export class MigrationRunner {
  run(database: Database.Database, migrationsPath: string): void {
    database.exec(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version TEXT PRIMARY KEY,
        applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    const applied = new Set(
      (database.prepare('SELECT version FROM schema_migrations').all() as Array<{ version: string }>).map(
        ({ version }) => version,
      ),
    );
    const files = readdirSync(migrationsPath).filter((file) => /^\d{3}_.+\.sql$/.test(file)).sort();

    for (const file of files) {
      const version = file.slice(0, 3);
      if (applied.has(version)) continue;
      const sql = readFileSync(join(migrationsPath, file), 'utf8');
      database.transaction(() => {
        database.exec(sql);
        database.prepare('INSERT INTO schema_migrations (version) VALUES (?)').run(version);
      })();
    }
  }
}
