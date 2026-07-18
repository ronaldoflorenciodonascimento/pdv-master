import { BaseRepository } from './BaseRepository';
import { Supplier } from './entities';
export class SupplierRepository extends BaseRepository<Supplier> { constructor() { super('suppliers'); } }
