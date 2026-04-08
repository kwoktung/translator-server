import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { listVocabularyFn, removeVocabularyFn } from '#/actions/vocabulary'
import { speakText } from '#/utils/tts'
import type { VocabularyEntry } from '../db/schema'

export function VocabularyPage() {
  const queryClient = useQueryClient()

  const { data: words = [], isLoading } = useQuery({
    queryKey: ['vocabulary'],
    queryFn: () => listVocabularyFn(),
  })

  const { mutate: removeWord } = useMutation({
    mutationFn: (id: string) => removeVocabularyFn({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vocabulary'] })
    },
  })

  if (isLoading) {
    return (
      <main className="flex min-h-[calc(100vh-8rem)] items-center justify-center">
        <span className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-2 w-2 animate-bounce rounded-full bg-[var(--lagoon)]"
              style={{ animationDelay: `${i * 120}ms` }}
            />
          ))}
        </span>
      </main>
    )
  }

  if (words.length === 0) {
    return (
      <main className="flex min-h-[calc(100vh-8rem)] items-center justify-center">
        <p className="text-(--sea-ink-soft)">
          No words saved yet. Translate a word and save it here.
        </p>
      </main>
    )
  }

  return (
    <main className="page-wrap px-4 py-6">
      <h1 className="display-title mb-6 text-3xl font-bold text-(--sea-ink) sm:text-4xl">
        Vocabulary
      </h1>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {words.map((entry) => (
          <WordCard key={entry.id} entry={entry} onRemove={removeWord} />
        ))}
      </div>
    </main>
  )
}

function WordCard({
  entry,
  onRemove,
}: {
  entry: VocabularyEntry
  onRemove: (id: string) => void
}) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="island-shell rounded-2xl p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-bold text-(--sea-ink)">{entry.word}</p>
          {entry.phonetic && (
            <div className="flex items-center gap-2">
              <p className="text-sm text-(--sea-ink-soft)">{entry.phonetic}</p>
              <button
                onClick={() => speakText(entry.word)}
                title="Listen to pronunciation"
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-(--sea-ink-soft) transition hover:bg-[var(--lagoon)] hover:text-white"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  width="14"
                  height="14"
                >
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                </svg>
              </button>
            </div>
          )}
          {entry.meaning && (
            <p className="mt-1 text-sm text-(--sea-ink)">{entry.meaning}</p>
          )}
        </div>
        <button
          onClick={() => onRemove(entry.id)}
          title="Remove"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-(--sea-ink-soft) transition hover:bg-red-100 hover:text-red-500"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
            <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
          </svg>
        </button>
      </div>

      {(entry.mnemonic || entry.example) && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="mt-2 text-xs text-[var(--lagoon)] hover:underline"
        >
          {expanded ? 'Hide details' : 'Show details'}
        </button>
      )}

      {expanded && (
        <div className="mt-2 space-y-1 border-t border-(--line) pt-2">
          {entry.mnemonic && (
            <p className="text-xs text-(--sea-ink-soft)">
              <span className="font-semibold">Mnemonic: </span>
              {entry.mnemonic}
            </p>
          )}
          {entry.example && (
            <p className="text-xs text-(--sea-ink-soft)">
              <span className="font-semibold">Example: </span>
              {entry.example}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
