import { DatabaseManager } from '../database/DatabaseManager';
import { AuthService } from '../services/AuthService';

export class AppController {
  private readonly database = DatabaseManager.getInstance();
  async initialize(userDataPath: string, migrationsPath: string): Promise<void> {
    this.database.initialize(userDataPath, migrationsPath);
    await AuthService.getInstance().ensureInitialAdministrator();
  }
  status(): { databaseReady: boolean; databasePath: string | null } { return this.database.status(); }
}
