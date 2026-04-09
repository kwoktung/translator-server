import { createServerFn } from '@tanstack/react-start'
import { and, eq } from 'drizzle-orm'
import { z } from 'zod'
import { getDb } from '#/db'
import { getEnv } from '#/env.server'
import { vocabulary } from '../../db/schema'
import { getSessionFn } from '#/actions/get-session'
import { wordTranslateFn } from '#/actions/translate/word'

async function requireUserId(): Promise<string> {
  const session = await getSessionFn()
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!session?.user?.id) throw new Error('Unauthorized')
  return session.user.id
}

export const listVocabularyFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    const userId = await requireUserId()
    const db = getDb(getEnv())
    return db
      .select()
      .from(vocabulary)
      .where(eq(vocabulary.userId, userId))
      .orderBy(vocabulary.createdAt)
  },
)

export const addVocabularyFn = createServerFn({ method: 'POST' })
  .inputValidator((data) => z.object({ word: z.string().min(1) }).parse(data))
  .handler(async ({ data }) => {
    const userId = await requireUserId()
    const db = getDb(getEnv())

    const existing = await db
      .select({ id: vocabulary.id })
      .from(vocabulary)
      .where(and(eq(vocabulary.userId, userId), eq(vocabulary.word, data.word)))
      .limit(1)

    if (existing.length > 0) {
      return { id: existing[0].id, word: data.word, inserted: false }
    }

    const enriched = await wordTranslateFn({
      data: { word: data.word, source: 'en', target: 'zh' },
    })

    const id = crypto.randomUUID()
    await db.insert(vocabulary).values({
      id,
      userId,
      word: data.word,
      phonetic: enriched.phonetic,
      meaning: enriched.meaning,
      mnemonic: enriched.mnemonic,
      example: enriched.example,
      createdAt: Date.now(),
    })

    return { id, word: data.word, inserted: true }
  })

export const removeVocabularyFn = createServerFn({ method: 'POST' })
  .inputValidator((data) => z.object({ id: z.string().min(1) }).parse(data))
  .handler(async ({ data }) => {
    const userId = await requireUserId()
    const db = getDb(getEnv())

    await db
      .delete(vocabulary)
      .where(and(eq(vocabulary.id, data.id), eq(vocabulary.userId, userId)))

    return { success: true }
  })
