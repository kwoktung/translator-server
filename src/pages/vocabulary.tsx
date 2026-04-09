import { useRef, useState } from 'react'
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { listVocabularyFn, removeVocabularyFn } from '#/actions/vocabulary'
import { useAudioPlay } from '#/hooks/use-audio-play'
import { useDebounce } from '#/hooks/use-debounce'
import type { VocabularyEntry } from '../db/schema'

export function VocabularyPage() {
  return (
    <main className="page-wrap px-4 py-6">
      <VocabularyHeader />
      <VocabularyContent />
    </main>
  )
}

function VocabularyHeader() {
  return (
    <div className="mb-6 flex items-center justify-between">
      <h1 className="display-title text-3xl font-bold text-(--sea-ink) sm:text-4xl">
        Vocabulary
      </h1>
      <div className="flex items-center gap-2">
        <Link
          to="/vocabulary/import"
          title="Import"
          className="island-shell flex h-9 w-9 items-center justify-center rounded-xl text-(--sea-ink)"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 13v8" />
            <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
            <path d="m8 17 4-4 4 4" />
          </svg>
        </Link>
        <Link
          to="/warmup"
          title="Warm up"
          className="island-shell flex h-9 w-9 items-center justify-center rounded-xl text-(--sea-ink)"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
            <path d="M13.5 0.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5 0.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z" />
          </svg>
        </Link>
      </div>
    </div>
  )
}

function VocabularyContent() {
  const queryClient = useQueryClient()
  const [prefix, setPrefix] = useState('')
  const debouncedPrefix = useDebounce(prefix.toLowerCase().trim(), 1000)

  const { data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage } =
    useInfiniteQuery({
      queryKey: ['vocabulary', debouncedPrefix],
      queryFn: ({ pageParam }) =>
        listVocabularyFn({
          data: {
            prefix: debouncedPrefix || undefined,
            cursor: pageParam ?? undefined,
          },
        }),
      initialPageParam: null as number | null,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    })

  const words = data?.pages.flatMap((p) => p.items) ?? []

  const { mutate: removeWord } = useMutation({
    mutationFn: (id: number) => removeVocabularyFn({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vocabulary'] })
    },
  })

  if (isLoading && !debouncedPrefix) {
    return (
      <div className="flex min-h-[calc(100vh-16rem)] items-center justify-center">
        <span className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-2 w-2 animate-bounce rounded-full bg-(--lagoon)"
              style={{ animationDelay: `${i * 120}ms` }}
            />
          ))}
        </span>
      </div>
    )
  }

  if (words.length === 0 && !debouncedPrefix) {
    return (
      <div className="flex min-h-[calc(100vh-16rem)] items-center justify-center">
        <div className="text-center">
          <p className="text-(--sea-ink-soft)">
            No words saved yet. Translate a word and save it here.
          </p>
          <Link
            to="/vocabulary/import"
            className="mt-3 inline-block text-sm font-semibold text-(--lagoon) hover:underline"
          >
            Or import a word list →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-4">
        <input
          type="search"
          value={prefix}
          onChange={(e) => setPrefix(e.target.value)}
          placeholder="Search by prefix…"
          className="w-full rounded-xl px-3 py-2 text-sm text-(--sea-ink) placeholder:text-(--sea-ink-soft) outline-none"
        />
      </div>
      {words.length === 0 ? (
        <div className="flex min-h-[calc(100vh-20rem)] items-center justify-center">
          <p className="text-(--sea-ink-soft)">
            No words starting with &ldquo;{debouncedPrefix}&rdquo;.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className="border-b border-(--line) px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-(--sea-ink-soft)">
                  Word
                </th>
                <th className="border-b border-(--line) px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-(--sea-ink-soft)">
                  Phonetic
                </th>
                <th className="border-b border-(--line) px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-(--sea-ink-soft)">
                  Meaning
                </th>
                <th className="border-b border-(--line) px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {words.map((entry) => (
                <WordRow key={entry.id} entry={entry} onRemove={removeWord} />
              ))}
            </tbody>
          </table>
          {hasNextPage && (
            <div className="mt-4 flex justify-center">
              <button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="rounded-xl px-4 py-2 text-sm font-semibold text-(--lagoon) transition hover:bg-(--surface) disabled:opacity-50"
              >
                {isFetchingNextPage ? 'Loading…' : 'Load more'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function WordRow({
  entry,
  onRemove,
}: {
  entry: VocabularyEntry
  onRemove: (id: number) => void
}) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const { loading, playing, play } = useAudioPlay()
  const isActive = loading || playing

  return (
    <tr className="border-b border-(--line) transition-colors hover:bg-(--surface)">
      <td className="px-3 py-2 align-middle font-bold text-(--sea-ink)">
        {entry.word}
      </td>
      <td className="px-3 py-2 align-middle">
        {entry.phonetic && (
          <div className="flex items-center gap-1.5">
            <span className="text-(--sea-ink-soft)">{entry.phonetic}</span>
            <button
              onClick={() => play(`/audio/w/${encodeURIComponent(entry.word)}`)}
              disabled={isActive}
              title="Listen to pronunciation"
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-(--sea-ink-soft) transition hover:bg-[var(--lagoon)] hover:text-white disabled:opacity-50"
            >
              {isActive ? (
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  width="14"
                  height="14"
                >
                  <rect x="6" y="5" width="4" height="14" rx="1" />
                  <rect x="14" y="5" width="4" height="14" rx="1" />
                </svg>
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  width="14"
                  height="14"
                >
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                </svg>
              )}
            </button>
          </div>
        )}
      </td>
      <td className="px-3 py-2 align-middle text-(--sea-ink)">
        {entry.meaning}
      </td>
      <td className="px-3 py-2 align-middle text-right whitespace-nowrap">
        <button
          onClick={() => dialogRef.current?.showModal()}
          title="Remove"
          className="inline-flex h-7 w-7 items-center justify-center rounded-full text-(--sea-ink-soft) transition hover:bg-red-100 hover:text-red-500"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
            <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
          </svg>
        </button>
        <dialog
          ref={dialogRef}
          className="island-shell m-auto w-[calc(100%-2rem)] max-w-sm rounded-2xl p-6 outline-none backdrop:bg-black/30 backdrop:backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) dialogRef.current?.close()
          }}
        >
          <h3 className="font-bold text-(--sea-ink)">Remove word?</h3>
          <p className="mt-1 text-sm text-(--sea-ink-soft)">
            <strong className="text-(--sea-ink)">{entry.word}</strong> will be
            removed from your vocabulary.
          </p>
          <div className="mt-5 flex justify-end gap-2">
            <button
              onClick={() => dialogRef.current?.close()}
              className="rounded-xl px-4 py-2 text-sm text-(--sea-ink-soft) transition hover:bg-[var(--line)]"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onRemove(entry.id)
                dialogRef.current?.close()
              }}
              className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600"
            >
              Remove
            </button>
          </div>
        </dialog>
      </td>
    </tr>
  )
}
