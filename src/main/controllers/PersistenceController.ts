import { DatabaseManager } from '../database/DatabaseManager';
import { BaseController, ControllerResponse } from './BaseController';

export class PersistenceController extends BaseController {
  constructor(private readonly database = DatabaseManager.getInstance()) { super(); }
  status(): ControllerResponse<{ databaseReady: boolean; databasePath: string | null }> { return this.execute(() => this.database.status()); }
}
