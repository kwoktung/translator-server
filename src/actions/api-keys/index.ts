import { createServerOnlyFn } from '@tanstack/react-start'
import { and, desc, eq } from 'drizzle-orm'
import { getDb } from '#/db'
import { getEnv } from '#/env.server'
import { apiKeys } from '#/db/schema'

function generateApiKey(): string {
  return 'wc_' + crypto.randomUUID().replace(/-/g, '')
}

export interface ApiKeyItem {
  id: number
  name: string
  key: string
  createdAt: number
}

export const listApiKeys = createServerOnlyFn(
  async ({ userId }: { userId: string }): Promise<ApiKeyItem[]> => {
    return getDb(getEnv())
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

export const createApiKey = createServerOnlyFn(
  async ({
    userId,
    name,
  }: {
    userId: string
    name: string
  }): Promise<ApiKeyItem> => {
    const db = getDb(getEnv())
    const key = generateApiKey()
    const createdAt = Date.now()
    const [row] = await db
      .insert(apiKeys)
      .values({ userId, name, key, createdAt })
      .returning({ id: apiKeys.id })
    return { id: row.id, name, key, createdAt }
  },
)

export const deleteApiKey = createServerOnlyFn(
  async ({ userId, id }: { userId: string; id: number }): Promise<void> => {
    await getDb(getEnv())
      .delete(apiKeys)
      .where(and(eq(apiKeys.id, id), eq(apiKeys.userId, userId)))
  },
)

export const getUserIdByApiKey = createServerOnlyFn(
  async (token: string): Promise<string | null> => {
    const rows = await getDb(getEnv())
      .select({ userId: apiKeys.userId })
      .from(apiKeys)
      .where(eq(apiKeys.key, token))
      .limit(1)
    return rows[0]?.userId ?? null
  },
)
