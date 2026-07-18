export interface ControllerResponse<T> { success: boolean; data?: T; error?: { code: string; message: string }; }

/** Padroniza respostas consumidas por IPC, sem expor detalhes internos ao renderer. */
export abstract class BaseController {
  protected execute<T>(operation: () => T): ControllerResponse<T> {
    try { return { success: true, data: operation() }; }
    catch (error) {
      return { success: false, error: { code: error instanceof Error ? error.name : 'UNKNOWN_ERROR', message: error instanceof Error ? error.message : 'Erro inesperado.' } };
    }
  }
  protected async executeAsync<T>(operation: () => Promise<T>): Promise<ControllerResponse<T>> {
    try { return { success: true, data: await operation() }; }
    catch (error) { return { success: false, error: { code: error instanceof Error ? error.name : 'UNKNOWN_ERROR', message: error instanceof Error ? error.message : 'Erro inesperado.' } }; }
  }
}
