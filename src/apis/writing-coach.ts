import { eq } from 'drizzle-orm'
import { createWorkersAI } from 'workers-ai-provider'
import { z } from 'zod'
import { getDb } from '#/db'
import { getEnv } from '#/env.server'
import { apiKeys, writingTurns } from '#/db/schema'
import { getWritingFeedback } from '#/utils/llm/writing-coach'

const bodySchema = z.object({ text: z.string().min(1).max(2000) })

export const handlers = {
  POST: async ({ request }: { request: Request }) => {
    const authHeader = request.headers.get('Authorization') ?? ''
    const match = /^Bearer\s+(.+)$/.exec(authHeader)
    if (!match) {
      return Response.json(
        { error: 'Missing or invalid Authorization header' },
        { status: 401 },
      )
    }
    const token = match[1]

    const body = await request.json().catch(() => null)
    const parsed = bodySchema.safeParse(body)
    if (!parsed.success) {
      return Response.json(
        { error: z.treeifyError(parsed.error) },
        { status: 400 },
      )
    }

    const env = getEnv()
    const db = getDb(env)
    const rows = await db
      .select({ userId: apiKeys.userId })
      .from(apiKeys)
      .where(eq(apiKeys.key, token))
      .limit(1)

    if (!rows.length) {
      return Response.json({ error: 'Invalid API key' }, { status: 401 })
    }
    const { userId } = rows[0]

    const workersai = createWorkersAI({ binding: env.AI })
    const model = workersai('@cf/moonshotai/kimi-k2.5')
    const { revised, suggestions } = await getWritingFeedback(model, {
      text: parsed.data.text,
    })

    const createdAt = Date.now()
    const [row] = await db
      .insert(writingTurns)
      .values({
        userId,
        original: parsed.data.text,
        revised,
        suggestions: JSON.stringify(suggestions),
        createdAt,
      })
      .returning({ id: writingTurns.id })

    return Response.json({
      id: row.id,
      original: parsed.data.text,
      revised,
      suggestions,
      createdAt,
    })
  },
}
