import { DatabaseManager } from './DatabaseManager';

/** Fachada de compatibilidade para pontos antigos de inicialização. */
export class DatabaseService {
  private readonly database = DatabaseManager.getInstance();

  initialize(userDataPath: string, migrationsPath: string): void {
    this.database.initialize(userDataPath, migrationsPath);
  }

  status(): { databaseReady: boolean; databasePath: string | null } {
    return this.database.status();
  }
}
