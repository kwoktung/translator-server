import {
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core'

export const vocabulary = sqliteTable(
  'vocabulary',
  {
    id: text('id').primaryKey(),
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
