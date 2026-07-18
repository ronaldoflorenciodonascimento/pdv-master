import { BaseRepository } from './BaseRepository';
import { Customer } from './entities';
export class CustomerRepository extends BaseRepository<Customer> { constructor() { super('customers'); } }
