export interface CompanyDto {
  id: number; uuid: string; legalName: string; tradeName: string; document: string | null;
  stateRegistration: string | null; municipalRegistration: string | null; phone: string | null; email: string | null;
  postalCode: string | null; street: string | null; streetNumber: string | null; complement: string | null;
  district: string | null; city: string | null; state: string | null; country: string; logoPath: string | null;
  currency: string; timezone: string; backupPath: string | null;
}
export interface SaveCompanyInput {
  legalName: string; tradeName: string; document?: string; stateRegistration?: string; municipalRegistration?: string;
  phone?: string; email?: string; postalCode?: string; street?: string; streetNumber?: string; complement?: string;
  district?: string; city?: string; state?: string; country?: string; currency?: string; timezone?: string; backupPath?: string;
}
