/* eslint-disable @typescript-eslint/no-explicit-any */
interface AuthUser { id: number; companyId: number; name: string; email: string; mustChangePassword: boolean; }
interface AuthResponse<T> { success: boolean; data?: T; error?: { code: string; message: string }; }
interface Window {
  pdvMaster: {
    getAppStatus: () => Promise<{ success: boolean; data?: { databaseReady: boolean } }>;
    auth: {
      login: (email: string, password: string) => Promise<AuthResponse<AuthUser>>;
      logout: () => Promise<AuthResponse<null>>;
      session: () => Promise<AuthResponse<AuthUser | null>>;
      changePassword: (currentPassword: string, newPassword: string) => Promise<AuthResponse<AuthUser>>;
    };
  };
  pdv: { company: { get: () => Promise<AuthResponse<CompanyDto | null>>; save: (data: Record<string, string | undefined>) => Promise<AuthResponse<CompanyDto>>; }; categories: any; products: any; };
}
interface CompanyDto { id: number; uuid: string; legalName: string; tradeName: string; document: string | null; stateRegistration: string | null; municipalRegistration: string | null; phone: string | null; email: string | null; postalCode: string | null; street: string | null; streetNumber: string | null; complement: string | null; district: string | null; city: string | null; state: string | null; country: string; logoPath: string | null; currency: string; timezone: string; backupPath: string | null; }
interface FormDataConstructor { new(form?: HTMLFormElement | EventTarget | null): FormData; }
