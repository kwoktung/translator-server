import { createServerFn } from '@tanstack/react-start'
import { and, desc, eq } from 'drizzle-orm'
import { createWorkersAI } from 'workers-ai-provider'
import { z } from 'zod'
import { getDb } from '#/db'
import { getEnv } from '#/env.server'
import { writingTurns } from '#/db/schema'
import { getSessionFn } from '#/actions/get-session'
import { getWritingFeedback } from '#/utils/llm/writing-coach'

async function requireUserId(): Promise<string> {
  const session = await getSessionFn()
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!session?.user?.id) throw new Error('Unauthorized')
  return session.user.id
}

export interface WritingFeedback {
  id: number
  original: string
  revised: string
  suggestions: string[]
  createdAt: number
}

export const getWritingFeedbackFn = createServerFn<
  'POST',
  { text: string },
  WritingFeedback
>({ method: 'POST' })
  .inputValidator((data) =>
    z.object({ text: z.string().min(1).max(2000) }).parse(data),
  )
  .handler(async ({ data }) => {
    const userId = await requireUserId()
    const env = getEnv()
    const workersai = createWorkersAI({ binding: env.AI })
    const model = workersai('@cf/moonshotai/kimi-k2.5')

    const { revised, suggestions } = await getWritingFeedback(model, {
      text: data.text,
    })

    const createdAt = Date.now()

    const [row] = await getDb(env)
      .insert(writingTurns)
      .values({
        userId,
        original: data.text,
        revised,
        suggestions: JSON.stringify(suggestions),
        createdAt,
      })
      .returning({ id: writingTurns.id })

    return { id: row.id, original: data.text, revised, suggestions, createdAt }
  })

export const deleteWritingTurnFn = createServerFn<'POST', { id: number }, void>(
  { method: 'POST' },
)
  .inputValidator((data) => z.object({ id: z.number().int() }).parse(data))
  .handler(async ({ data }) => {
    const userId = await requireUserId()
    const db = getDb(getEnv())
    await db
      .delete(writingTurns)
      .where(and(eq(writingTurns.id, data.id), eq(writingTurns.userId, userId)))
  })

export const listWritingTurnsFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    const userId = await requireUserId()
    const db = getDb(getEnv())

    const rows = await db
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
