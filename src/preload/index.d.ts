export interface AuthUser { id: number; companyId: number; name: string; email: string; mustChangePassword: boolean; }
export interface AuthResponse<T> { success: boolean; data?: T; error?: { code: string; message: string }; }
export interface PdvMasterApi {
  getAppStatus: () => Promise<{ success: boolean; data?: { databaseReady: boolean } }>;
  auth: {
    login: (email: string, password: string) => Promise<AuthResponse<AuthUser>>;
    logout: () => Promise<AuthResponse<null>>;
    session: () => Promise<AuthResponse<AuthUser | null>>;
    changePassword: (currentPassword: string, newPassword: string) => Promise<AuthResponse<AuthUser>>;
  };
}
declare global { interface Window { pdvMaster: PdvMasterApi; } }

export interface CompanyDto { id: number; uuid: string; legalName: string; tradeName: string; document: string | null; stateRegistration: string | null; municipalRegistration: string | null; phone: string | null; email: string | null; postalCode: string | null; street: string | null; streetNumber: string | null; complement: string | null; district: string | null; city: string | null; state: string | null; country: string; logoPath: string | null; currency: string; timezone: string; backupPath: string | null; }
declare global { interface Window { pdv: { company: { get: () => Promise<AuthResponse<CompanyDto | null>>; save: (data: Record<string, string | undefined>) => Promise<AuthResponse<CompanyDto>>; }; }; } }
