import { createServerFn } from '@tanstack/react-start'
import { and, eq, gt, like } from 'drizzle-orm'
import { z } from 'zod'
import { getDb } from '#/db'
import { getEnv } from '#/env.server'
import { vocabulary } from '../../db/schema'
import { wordTranslateFn } from '#/actions/translate/word'
import { serverFnErrorMiddleware } from '#/middlewares/server-fn-error'
import { requireUserId } from '#/utils/require-user-id'

const LIST_VOCABULARY_MAX_LIMIT = 1000
const LIST_VOCABULARY_DEFAULT_LIMIT = 50

export const listVocabularyFn = createServerFn({ method: 'GET' })
  .inputValidator((data) =>
    z
      .object({
        prefix: z.string().optional(),
        cursor: z.number().int().optional(),
        limit: z
          .number()
          .int()
          .min(1)
          .max(LIST_VOCABULARY_MAX_LIMIT)
          .optional()
          .default(LIST_VOCABULARY_DEFAULT_LIMIT),
      })
      .parse(data),
  )
  .middleware([serverFnErrorMiddleware])
  .handler(async ({ data }) => {
    const userId = await requireUserId()
    const db = getDb(getEnv())

    const conditions = [eq(vocabulary.userId, userId)]
    if (data.prefix) {
      conditions.push(like(vocabulary.word, `${data.prefix}%`))
    }
    if (data.cursor !== undefined) {
      conditions.push(gt(vocabulary.id, data.cursor))
    }

    const rows = await db
      .select()
      .from(vocabulary)
      .where(and(...conditions))
      .orderBy(vocabulary.id)
      .limit(data.limit + 1)

    const hasMore = rows.length > data.limit
    const items = hasMore ? rows.slice(0, data.limit) : rows
    const nextCursor = hasMore ? items[items.length - 1].id : null

    return { items, nextCursor }
  })

export const addVocabularyFn = createServerFn({ method: 'POST' })
  .inputValidator((data) => z.object({ word: z.string().min(1) }).parse(data))
  .middleware([serverFnErrorMiddleware])
  .handler(async ({ data }) => {
    const userId = await requireUserId()
    const db = getDb(getEnv())
    const word = data.word.trim().toLowerCase()

    const existing = await db
      .select({ id: vocabulary.id })
      .from(vocabulary)
      .where(and(eq(vocabulary.userId, userId), eq(vocabulary.word, word)))
      .limit(1)

    if (existing.length > 0) {
      return { id: existing[0].id, word: word, inserted: false }
    }

    const enriched = await wordTranslateFn({
      data: { word: word, source: 'en', target: 'zh' },
    })

    const [row] = await db
      .insert(vocabulary)
      .values({
        userId,
        word,
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
