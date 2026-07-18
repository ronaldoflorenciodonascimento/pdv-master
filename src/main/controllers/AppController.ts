import { DatabaseManager } from '../database/DatabaseManager';

export class AppController {
  private readonly database = DatabaseManager.getInstance();
  initialize(userDataPath: string, migrationsPath: string): void { this.database.initialize(userDataPath, migrationsPath); }
  status(): { databaseReady: boolean; databasePath: string | null } { return this.database.status(); }
}
