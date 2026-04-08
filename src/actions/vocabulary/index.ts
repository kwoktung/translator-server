import { createServerFn } from '@tanstack/react-start'
import { and, eq } from 'drizzle-orm'
import { z } from 'zod'
import { getDb } from '#/db'
import { getEnv } from '#/env.server'
import { vocabulary } from '../../db/schema'
import { getSessionFn } from '#/actions/get-session'

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

const addVocabularyInput = z.object({
  word: z.string().min(1),
  phonetic: z.string().optional(),
  meaning: z.string().optional(),
  mnemonic: z.string().optional(),
  example: z.string().optional(),
})

export type AddVocabularyInput = z.infer<typeof addVocabularyInput>

export const addVocabularyFn = createServerFn({ method: 'POST' })
  .inputValidator((data) => addVocabularyInput.parse(data))
  .handler(async ({ data }) => {
    const userId = await requireUserId()
    const db = getDb(getEnv())
    const id = crypto.randomUUID()

    await db
      .insert(vocabulary)
      .values({
        id,
        userId,
        word: data.word,
        phonetic: data.phonetic ?? null,
        meaning: data.meaning ?? null,
        mnemonic: data.mnemonic ?? null,
        example: data.example ?? null,
        createdAt: Date.now(),
      })
      .onConflictDoNothing()

    return { id, word: data.word }
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
