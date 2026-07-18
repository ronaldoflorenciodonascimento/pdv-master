interface Window { pdvMaster: { getAppStatus: () => Promise<{ success: boolean; data?: { databaseReady: boolean } }>; }; }
