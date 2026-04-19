import { createServerOnlyFn } from '@tanstack/react-start'
import { and, desc, eq, gte, lt } from 'drizzle-orm'
import { getDb } from '#/db'
import { getEnv } from '#/env.server'
import { getModelFor } from '#/utils/ai.server'
import { writingTurns } from '#/db/schema'
import { getWritingFeedback } from '#/utils/llm/writing-coach'

export interface PreviewFeedback {
  revised: string
  suggestions: string[]
}

export interface WritingFeedback {
  id: number
  original: string
  revised: string
  suggestions: string[]
  createdAt: number
}

export const previewWritingFeedback = createServerOnlyFn(
  async ({ text }: { text: string }): Promise<PreviewFeedback> => {
    const model = getModelFor('writingCoach')
    return getWritingFeedback(model, { text })
  },
)

export const createWritingTurn = createServerOnlyFn(
  async ({
    userId,
    text,
  }: {
    userId: string
    text: string
  }): Promise<WritingFeedback> => {
    const model = getModelFor('writingCoach')
    const { revised, suggestions } = await getWritingFeedback(model, { text })

    const createdAt = Date.now()
    const [row] = await getDb(getEnv())
      .insert(writingTurns)
      .values({
        userId,
        original: text,
        revised,
        suggestions: JSON.stringify(suggestions),
        createdAt,
      })
      .returning({ id: writingTurns.id })

    return { id: row.id, original: text, revised, suggestions, createdAt }
  },
)

export interface ListWritingTurnsResult {
  items: WritingFeedback[]
  nextCursor: number | null
}

const LIST_WRITING_TURNS_DEFAULT_LIMIT = 20

export const listWritingTurns = createServerOnlyFn(
  async ({
    userId,
    cursor,
    limit = LIST_WRITING_TURNS_DEFAULT_LIMIT,
    from,
  }: {
    userId: string
    cursor?: number
    limit?: number
    from?: number
  }): Promise<ListWritingTurnsResult> => {
    const conditions = [eq(writingTurns.userId, userId)]
    if (from !== undefined) conditions.push(gte(writingTurns.createdAt, from))
    if (cursor !== undefined)
      conditions.push(lt(writingTurns.createdAt, cursor))

    const rows = await getDb(getEnv())
      .select()
      .from(writingTurns)
      .where(and(...conditions))
      .orderBy(desc(writingTurns.createdAt))
      .limit(limit + 1)

    const hasMore = rows.length > limit
    const items = hasMore ? rows.slice(0, limit) : rows
    return {
      items: items.map((row) => ({
        ...row,
        suggestions: JSON.parse(row.suggestions) as string[],
      })),
      nextCursor: hasMore ? items[items.length - 1].createdAt : null,
    }
  },
)

export const deleteWritingTurn = createServerOnlyFn(
  async ({ userId, id }: { userId: string; id: number }): Promise<void> => {
    await getDb(getEnv())
      .delete(writingTurns)
      .where(and(eq(writingTurns.id, id), eq(writingTurns.userId, userId)))
  },
)
