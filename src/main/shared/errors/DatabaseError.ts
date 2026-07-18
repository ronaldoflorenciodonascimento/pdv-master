export class DatabaseError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'DatabaseError';
  }
}

export class NotFoundError extends DatabaseError {
  constructor(entity: string, id: number) {
    super(`${entity} com identificador ${id} não foi encontrado.`);
    this.name = 'NotFoundError';
  }
}
