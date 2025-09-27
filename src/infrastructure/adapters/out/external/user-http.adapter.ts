import type { UserExternalPort } from '../../../../domain/ports/out/user-external.port';

export class UserHttpAdapter implements UserExternalPort {
  async getUser(id: string): Promise<{ id: string; role: string } | null> {
    // Implementa la lógica real aquí
    return { id, role: 'client' }; // Ejemplo de retorno
  }
}