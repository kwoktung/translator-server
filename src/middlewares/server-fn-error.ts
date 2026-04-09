import { createMiddleware } from '@tanstack/react-start'
import { ZodError } from 'zod'
import { UnauthorizedError } from '#/utils/errors'

export const serverFnErrorMiddleware = createMiddleware({
  type: 'function',
}).server(async ({ next, serverFnMeta }) => {
  try {
    return await next()
  } catch (error) {
    if (error instanceof UnauthorizedError || error instanceof ZodError) {
      throw error
    }
    console.error('[server-fn-error]', {
      fn: serverFnMeta.name,
      file: serverFnMeta.filename,
      error,
    })
    throw error
  }
})
