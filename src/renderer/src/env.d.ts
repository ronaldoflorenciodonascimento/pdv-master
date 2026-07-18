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
}
