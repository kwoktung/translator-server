import { ZodError, type ZodType, z } from 'zod'
import { UnauthorizedError } from '#/utils/errors'

type ValidatorTarget = 'json' | 'param' | 'query'
type TanStackHandler = (ctx: { request: Request; params?: unknown }) => Promise<Response>

// Opaque middleware descriptor — mirrors what zValidator() returns in Hono
export interface ValidatorMiddleware<T extends ValidatorTarget, S> {
  readonly _tag: 'validator'
  readonly target: T
  readonly schema: ZodType<S>
}

// Context object — Hono-style c
type ApiContext<
  TValidated extends Partial<Record<ValidatorTarget, unknown>> = Record<never, never>,
> = {
  req: {
    raw: Request
    valid<K extends keyof TValidated>(target: K): TValidated[K]
  }
  json<T>(data: T, status?: number): Response
  text(text: string, status?: number): Response
}

function toErrorResponse(error: unknown): Response {
  if (error instanceof UnauthorizedError)
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  if (error instanceof ZodError)
    return Response.json({ error: z.treeifyError(error) }, { status: 400 })
  console.error('[api-route]', error)
  return Response.json({ error: 'Internal server error' }, { status: 500 })
}

// ── zValidator ────────────────────────────────────────────────────────────────
// Mirrors Hono's zValidator(target, schema) — produces a typed middleware descriptor

export function zValidator<T extends ValidatorTarget, S extends ZodType>(
  target: T,
  schema: S,
): ValidatorMiddleware<T, z.infer<S>> {
  return { _tag: 'validator', target, schema } as ValidatorMiddleware<T, z.infer<S>>
}

// ── createApiRoute ────────────────────────────────────────────────────────────
// Overloads cover 0–2 validators (sufficient for all practical cases)

export function createApiRoute(
  handler: (c: ApiContext) => Promise<Response>,
): TanStackHandler

export function createApiRoute<T extends ValidatorTarget, S>(
  v: ValidatorMiddleware<T, S>,
  handler: (c: ApiContext<{ [K in T]: S }>) => Promise<Response>,
): TanStackHandler

export function createApiRoute<
  T1 extends ValidatorTarget,
  S1,
  T2 extends ValidatorTarget,
  S2,
>(
  v1: ValidatorMiddleware<T1, S1>,
  v2: ValidatorMiddleware<T2, S2>,
  handler: (c: ApiContext<{ [K in T1]: S1 } & { [K in T2]: S2 }>) => Promise<Response>,
): TanStackHandler

// Implementation
export function createApiRoute(...args: unknown[]): TanStackHandler {
  const handler = args.at(-1) as (
    c: ApiContext<Record<string, unknown>>,
  ) => Promise<Response>
  const validators = args.slice(0, -1) as ValidatorMiddleware<ValidatorTarget, unknown>[]

  return async ({ request, params }) => {
    try {
      const validated: Record<string, unknown> = {}

      for (const v of validators) {
        const raw =
          v.target === 'json'
            ? await request.json().catch(() => null)
            : v.target === 'param'
              ? params
              : Object.fromEntries(new URL(request.url).searchParams)

        const result = v.schema.safeParse(raw)
        if (!result.success) {
          return Response.json({ error: z.treeifyError(result.error) }, { status: 400 })
        }
        validated[v.target] = result.data
      }

      const c: ApiContext<Record<string, unknown>> = {
        req: {
          raw: request,
          valid: (target) => validated[target as string],
        },
        json: (data, status = 200) => Response.json(data, { status }),
        text: (text, status = 200) => new Response(text, { status }),
      }

      return await handler(c)
    } catch (error) {
      return toErrorResponse(error)
    }
  }
}
