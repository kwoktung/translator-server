import { createServerFn } from '@tanstack/react-start'
import { and, desc, eq } from 'drizzle-orm'
import { z } from 'zod'
import { getDb } from '#/db'
import { getEnv } from '#/env.server'
import { apiKeys } from '#/db/schema'
import { getSessionFn } from '#/actions/get-session'

async function requireUserId(): Promise<string> {
  const session = await getSessionFn()
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!session?.user?.id) throw new Error('Unauthorized')
  return session.user.id
}

function generateApiKey(): string {
  return 'wc_' + crypto.randomUUID().replace(/-/g, '')
}

export interface ApiKeyItem {
  id: number
  name: string
  key: string
  createdAt: number
}

export const createApiKeyFn = createServerFn<
  'POST',
  { name: string },
  ApiKeyItem
>({ method: 'POST' })
  .inputValidator((data) =>
    z.object({ name: z.string().min(1).max(100) }).parse(data),
  )
  .handler(async ({ data }) => {
    const userId = await requireUserId()
    const db = getDb(getEnv())
    const key = generateApiKey()
    const createdAt = Date.now()
    const [row] = await db
      .insert(apiKeys)
      .values({ userId, name: data.name, key, createdAt })
      .returning({ id: apiKeys.id })
    return { id: row.id, name: data.name, key, createdAt }
  })

export const listApiKeysFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    const userId = await requireUserId()
    const db = getDb(getEnv())
    return db
      .select({
        id: apiKeys.id,
        name: apiKeys.name,
        key: apiKeys.key,
        createdAt: apiKeys.createdAt,
      })
      .from(apiKeys)
      .where(eq(apiKeys.userId, userId))
      .orderBy(desc(apiKeys.createdAt))
  },
)

export const deleteApiKeyFn = createServerFn<'POST', { id: number }, void>({
  method: 'POST',
})
  .inputValidator((data) => z.object({ id: z.number().int() }).parse(data))
  .handler(async ({ data }) => {
    const userId = await requireUserId()
    const db = getDb(getEnv())
    await db
      .delete(apiKeys)
      .where(and(eq(apiKeys.id, data.id), eq(apiKeys.userId, userId)))
  })
