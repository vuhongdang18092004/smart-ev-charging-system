export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number | undefined,
    readonly code: string | undefined,
    cause: unknown,
  ) {
    super(message, { cause });
    this.name = "ApiError";
  }
}
