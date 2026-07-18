import { AuthService } from './AuthService';
import { CompanyRepository } from '../repositories/CompanyRepository';
import { CompanyDto } from '../company/company.types';
import { validateCompanyInput } from '../company/company.validation';
export class CompanyService {
  constructor(private readonly repository = new CompanyRepository(), private readonly auth = AuthService.getInstance()) {}
  getCompany(): CompanyDto | null { this.auth.requireAuthenticated(); return this.repository.findCurrent(); }
  saveCompany(input: unknown): CompanyDto { this.auth.requireAuthenticated(); return this.repository.upsertCurrent(validateCompanyInput(input)); }
}
