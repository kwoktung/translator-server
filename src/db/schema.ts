import {
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core'

export const writingTurns = sqliteTable(
  'writing_turns',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    userId: text('user_id').notNull(),
    original: text('original').notNull(),
    revised: text('revised').notNull(),
    suggestions: text('suggestions').notNull(),
    createdAt: integer('created_at').notNull(),
  },
  (t) => [index('writing_turns_user_created_idx').on(t.userId, t.createdAt)],
)

export type WritingTurn = typeof writingTurns.$inferSelect

export const vocabulary = sqliteTable(
  'vocabulary',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    userId: text('user_id').notNull(),
    word: text('word').notNull(),
    phonetic: text('phonetic'),
    meaning: text('meaning'),
    mnemonic: text('mnemonic'),
    example: text('example'),
    createdAt: integer('created_at').notNull(),
  },
  (t) => [uniqueIndex('vocabulary_user_word_idx').on(t.userId, t.word)],
)

export type VocabularyEntry = typeof vocabulary.$inferSelect

export const apiKeys = sqliteTable(
  'api_keys',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    userId: text('user_id').notNull(),
    name: text('name').notNull(),
    key: text('key').notNull(),
    createdAt: integer('created_at').notNull(),
  },
  (t) => [
    uniqueIndex('api_keys_key_idx').on(t.key),
    index('api_keys_user_created_idx').on(t.userId, t.createdAt),
  ],
)

export type ApiKey = typeof apiKeys.$inferSelect
