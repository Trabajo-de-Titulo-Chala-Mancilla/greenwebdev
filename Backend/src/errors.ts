/** Error con un mensaje apto para mostrar directamente al usuario. */
export class AppError extends Error {
  constructor(
    readonly statusCode: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

export class BlockedHostError extends AppError {
  constructor() {
    super(400, "BLOCKED_HOST", "Solo se pueden analizar sitios web públicos.");
  }
}

export class PageLoadError extends Error {}
