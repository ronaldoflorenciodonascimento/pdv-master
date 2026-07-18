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
