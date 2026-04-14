import { createServerOnlyFn } from '@tanstack/react-start'
import { and, desc, eq } from 'drizzle-orm'
import { createWorkersAI } from 'workers-ai-provider'
import { getDb } from '#/db'
import { getEnv } from '#/env.server'
import { writingTurns } from '#/db/schema'
import { getWritingFeedback } from '#/utils/llm/writing-coach'

export interface WritingFeedback {
  id: number
  original: string
  revised: string
  suggestions: string[]
  createdAt: number
}

export const createWritingTurn = createServerOnlyFn(
  async ({
    userId,
    text,
  }: {
    userId: string
    text: string
  }): Promise<WritingFeedback> => {
    const env = getEnv()
    const workersai = createWorkersAI({ binding: env.AI })
    const model = workersai('@cf/moonshotai/kimi-k2.5')
    const { revised, suggestions } = await getWritingFeedback(model, { text })

    const createdAt = Date.now()
    const [row] = await getDb(env)
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

export const listWritingTurns = createServerOnlyFn(
  async ({ userId }: { userId: string }): Promise<WritingFeedback[]> => {
    const rows = await getDb(getEnv())
      .select()
      .from(writingTurns)
      .where(eq(writingTurns.userId, userId))
      .orderBy(desc(writingTurns.createdAt))
      .limit(20)
    return rows.map((row) => ({
      ...row,
      suggestions: JSON.parse(row.suggestions) as string[],
    }))
  },
)

export const deleteWritingTurn = createServerOnlyFn(
  async ({ userId, id }: { userId: string; id: number }): Promise<void> => {
    await getDb(getEnv())
      .delete(writingTurns)
      .where(and(eq(writingTurns.id, id), eq(writingTurns.userId, userId)))
  },
)
