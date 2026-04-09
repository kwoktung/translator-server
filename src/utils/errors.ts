export class UnauthorizedError extends Error {
  readonly name = 'UnauthorizedError'
  constructor() {
    super('Unauthorized')
  }
}
