import { createServerOnlyFn } from '@tanstack/react-start'
import { and, eq, gt, like, desc } from 'drizzle-orm'
import { getDb } from '#/db'
import { getEnv } from '#/env.server'
import { vocabulary } from '../../db/schema'
import { translateWord } from '#/actions/translate/word'

const LIST_VOCABULARY_DEFAULT_LIMIT = 50

export const listVocabulary = createServerOnlyFn(
  async ({
    userId,
    prefix,
    cursor,
    limit = LIST_VOCABULARY_DEFAULT_LIMIT,
  }: {
    userId: string
    prefix?: string
    cursor?: number
    limit?: number
  }) => {
    const db = getDb(getEnv())
    const conditions = [eq(vocabulary.userId, userId)]
    if (prefix) conditions.push(like(vocabulary.word, `${prefix}%`))
    if (cursor !== undefined) conditions.push(gt(vocabulary.id, cursor))

    const rows = await db
      .select()
      .from(vocabulary)
      .where(and(...conditions))
      .orderBy(desc(vocabulary.id))
      .limit(limit + 1)

    const hasMore = rows.length > limit
    const items = hasMore ? rows.slice(0, limit) : rows
    return { items, nextCursor: hasMore ? items[items.length - 1].id : null }
  },
)

export const addVocabulary = createServerOnlyFn(
  async ({ userId, word: rawWord }: { userId: string; word: string }) => {
    const word = rawWord.trim().toLowerCase()
    const db = getDb(getEnv())

    const existing = await db
      .select({ id: vocabulary.id })
      .from(vocabulary)
      .where(and(eq(vocabulary.userId, userId), eq(vocabulary.word, word)))
      .limit(1)

    if (existing.length > 0)
      return { id: existing[0].id, word, inserted: false }

    const enriched = await translateWord({ word, source: 'en', target: 'zh' })

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

    return { id: row.id, word, inserted: true }
  },
)

export const removeVocabulary = createServerOnlyFn(
  async ({
    userId,
    id,
  }: {
    userId: string
    id: number
  }): Promise<{ success: true }> => {
    await getDb(getEnv())
      .delete(vocabulary)
      .where(and(eq(vocabulary.id, id), eq(vocabulary.userId, userId)))
    return { success: true }
  },
)
