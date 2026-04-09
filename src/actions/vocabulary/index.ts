import { createServerFn } from '@tanstack/react-start'
import { and, eq } from 'drizzle-orm'
import { z } from 'zod'
import { getDb } from '#/db'
import { getEnv } from '#/env.server'
import { vocabulary } from '../../db/schema'
import { wordTranslateFn } from '#/actions/translate/word'
import { serverFnErrorMiddleware } from '#/middlewares/server-fn-error'
import { requireUserId } from '#/utils/require-user-id'

export const listVocabularyFn = createServerFn({ method: 'GET' })
  .middleware([serverFnErrorMiddleware])
  .handler(async () => {
    const userId = await requireUserId()
    const db = getDb(getEnv())
    return db
      .select()
      .from(vocabulary)
      .where(eq(vocabulary.userId, userId))
      .orderBy(vocabulary.createdAt)
  })

export const addVocabularyFn = createServerFn({ method: 'POST' })
  .inputValidator((data) => z.object({ word: z.string().min(1) }).parse(data))
  .middleware([serverFnErrorMiddleware])
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

    const [row] = await db
      .insert(vocabulary)
      .values({
        userId,
        word: data.word,
        phonetic: enriched.phonetic,
        meaning: enriched.meaning,
        mnemonic: enriched.mnemonic,
        example: enriched.example,
        createdAt: Date.now(),
      })
      .returning({ id: vocabulary.id })

    return { id: row.id, word: data.word, inserted: true }
  })

export const removeVocabularyFn = createServerFn({ method: 'POST' })
  .inputValidator((data) => z.object({ id: z.number().int() }).parse(data))
  .middleware([serverFnErrorMiddleware])
  .handler(async ({ data }) => {
    const userId = await requireUserId()
    const db = getDb(getEnv())

    await db
      .delete(vocabulary)
      .where(and(eq(vocabulary.id, data.id), eq(vocabulary.userId, userId)))

    return { success: true }
  })
