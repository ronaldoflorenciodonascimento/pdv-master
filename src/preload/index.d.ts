export interface PdvMasterApi { getAppStatus: () => Promise<{ success: boolean; data?: { databaseReady: boolean } }>; }
declare global { interface Window { pdvMaster: PdvMasterApi; } }
