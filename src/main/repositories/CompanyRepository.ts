import { BaseRepository } from './BaseRepository';
import { Company } from './entities';
export class CompanyRepository extends BaseRepository<Company> { constructor() { super('companies'); } }
