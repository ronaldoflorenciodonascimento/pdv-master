import { CompanyDto } from '../company/company.types';
import { CompanyService } from '../services/CompanyService';
import { BaseController, ControllerResponse } from './BaseController';
export class CompanyController extends BaseController {
  constructor(private readonly service = new CompanyService()) { super(); }
  get(): ControllerResponse<CompanyDto | null> { return this.execute(() => this.service.getCompany()); }
  save(input: unknown): ControllerResponse<CompanyDto> { return this.execute(() => this.service.saveCompany(input)); }
}
