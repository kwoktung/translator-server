import { useEffect, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { addVocabularyFn } from '#/actions/vocabulary'

type WordStatus = 'pending' | 'processing' | 'done' | 'skipped' | 'error'

interface WordItem {
  word: string
  status: WordStatus
}

type Phase = 'input' | 'processing' | 'complete'

const MAX_WORDS = 50

function parseWords(raw: string): string[] {
  const seen = new Set<string>()
  return raw
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((word) => {
      const key = word.toLowerCase()
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
}

export function VocabularyImportPage() {
  const [phase, setPhase] = useState<Phase>('input')
  const [textarea, setTextarea] = useState('')
  const [items, setItems] = useState<WordItem[]>([])
  const processingRef = useRef(false)
  const queryClient = useQueryClient()

  const parsedWords = parseWords(textarea)
  const overLimit = parsedWords.length > MAX_WORDS
  const wordCount = parsedWords.length

  function startImport() {
    const words = parsedWords.slice(0, MAX_WORDS)
    setItems(words.map((word) => ({ word, status: 'pending' })))
    setPhase('processing')
  }

  useEffect(() => {
    if (phase !== 'processing' || processingRef.current) return
    processingRef.current = true

    async function run() {
      const words = items.map((i) => i.word)
      for (let idx = 0; idx < words.length; idx++) {
        const word = words[idx]
        setItems((prev) =>
          prev.map((item, i) =>
            i === idx ? { ...item, status: 'processing' } : item,
          ),
        )
        try {
          const result = await addVocabularyFn({ data: { word } })
          setItems((prev) =>
            prev.map((item, i) =>
              i === idx
                ? { ...item, status: result.inserted ? 'done' : 'skipped' }
                : item,
            ),
          )
        } catch {
          setItems((prev) =>
            prev.map((item, i) =>
              i === idx ? { ...item, status: 'error' } : item,
            ),
          )
        }
      }
      setPhase('complete')
      queryClient.invalidateQueries({ queryKey: ['vocabulary'] })
    }

    void run()
  }, [phase])

  const doneCount = items.filter((i) => i.status === 'done').length
  const skippedCount = items.filter((i) => i.status === 'skipped').length
  const errorCount = items.filter((i) => i.status === 'error').length

  return (
    <main className="page-wrap px-4 py-6">
      <div className="mb-6 flex items-center gap-3">
        <Link
          to="/vocabulary"
          className="flex items-center gap-1 text-sm text-(--sea-ink-soft) transition hover:text-(--sea-ink)"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
          </svg>
          Vocabulary
        </Link>
      </div>

      <h1 className="display-title mb-6 text-3xl font-bold text-(--sea-ink) sm:text-4xl">
        Import Words
      </h1>

      {phase === 'input' && (
        <div className="island-shell rounded-2xl p-6">
          <label
            htmlFor="word-list"
            className="island-kicker mb-2 block text-xs"
          >
            Word list
          </label>
          <textarea
            id="word-list"
            value={textarea}
            onChange={(e) => setTextarea(e.target.value)}
            placeholder={'apple\nbanana\neloquent\npersevere'}
            rows={10}
            className="w-full resize-none rounded-xl border border-(--line) bg-transparent px-3 py-2 font-mono text-sm text-(--sea-ink) outline-none placeholder:text-(--sea-ink-soft) focus:border-(--lagoon)"
          />
          <div className="mt-2 flex items-center justify-between gap-4">
            <p className="text-xs text-(--sea-ink-soft)">
              {wordCount > 0 ? (
                <>
                  <span className="font-semibold text-(--sea-ink)">
                    {wordCount}
                  </span>{' '}
                  word{wordCount !== 1 ? 's' : ''}
                  {overLimit && (
                    <span className="ml-2 text-amber-600">
                      · only first {MAX_WORDS} will be imported
                    </span>
                  )}
                </>
              ) : (
                'One word per line'
              )}
            </p>
            <button
              onClick={startImport}
              disabled={wordCount === 0}
              className="island-shell rounded-xl px-4 py-2 text-sm font-semibold text-(--sea-ink) transition disabled:cursor-not-allowed disabled:opacity-40"
            >
              Import →
            </button>
          </div>
        </div>
      )}

      {(phase === 'processing' || phase === 'complete') && (
        <div className="island-shell rounded-2xl p-6">
          {phase === 'complete' && (
            <div className="mb-4 rounded-xl bg-(--sand) px-4 py-3 text-sm">
              <span className="font-semibold text-(--sea-ink)">
                {doneCount} added
              </span>
              {skippedCount > 0 && (
                <span className="text-(--sea-ink-soft)">
                  {' '}
                  · {skippedCount} already existed
                </span>
              )}
              {errorCount > 0 && (
                <span className="text-red-500"> · {errorCount} failed</span>
              )}
            </div>
          )}

          <ul className="divide-y divide-(--line)">
            {items.map((item) => (
              <li
                key={item.word}
                className="flex items-center justify-between gap-3 py-2.5"
              >
                <span className="text-sm text-(--sea-ink)">{item.word}</span>
                <StatusChip status={item.status} />
              </li>
            ))}
          </ul>

          {phase === 'complete' && (
            <div className="mt-5 border-t border-(--line) pt-4">
              <Link
                to="/vocabulary"
                className="text-sm font-semibold text-(--lagoon) hover:underline"
              >
                ← Back to Vocabulary
              </Link>
            </div>
          )}
        </div>
      )}
    </main>
  )
}

function StatusChip({ status }: { status: WordStatus }) {
  if (status === 'pending') {
    return <span className="h-2 w-2 rounded-full bg-(--line)" />
  }
  if (status === 'processing') {
    return (
      <span className="flex gap-0.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 animate-bounce rounded-full bg-(--lagoon)"
            style={{ animationDelay: `${i * 120}ms` }}
          />
        ))}
      </span>
    )
  }
  if (status === 'done') {
    return (
      <span className="flex items-center gap-1 text-xs font-medium text-(--lagoon)">
        <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
          <path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
        </svg>
        added
      </span>
    )
  }
  if (status === 'skipped') {
    return <span className="text-xs text-(--sea-ink-soft)">already exists</span>
  }
  return <span className="text-xs text-red-500">failed</span>
}
