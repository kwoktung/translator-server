import { useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  deleteWritingTurnFn,
  getWritingFeedbackFn,
  listWritingTurnsFn,
} from '#/actions/writing-coach'
import type { WritingFeedback } from '#/actions/writing-coach'

const MAX_CHARS = 2000

export function WritingCoachPage() {
  const [text, setText] = useState('')
  const [result, setResult] = useState<WritingFeedback | null>(null)
  const queryClient = useQueryClient()

  const { data: history, isLoading: historyLoading } = useQuery({
    queryKey: ['writing-turns'],
    queryFn: () => listWritingTurnsFn(),
  })

  const { mutate, isPending } = useMutation({
    mutationFn: (input: string) =>
      getWritingFeedbackFn({ data: { text: input } }),
    onSuccess: (data) => {
      setResult(data)
      setText('')
      void queryClient.invalidateQueries({ queryKey: ['writing-turns'] })
    },
  })

  function handleSubmit() {
    if (!text.trim() || isPending) return
    mutate(text.trim())
  }

  function handleTryAnother() {
    setResult(null)
  }

  return (
    <main className="page-wrap px-4 py-6">
      <h1 className="display-title mb-6 text-3xl font-bold text-(--sea-ink) sm:text-4xl">
        Writing Coach
      </h1>

      {result ? (
        <ResultPanel result={result} onTryAnother={handleTryAnother} />
      ) : (
        <InputPanel
          text={text}
          onChange={setText}
          onSubmit={handleSubmit}
          isPending={isPending}
        />
      )}

      <HistorySection
        history={history ?? []}
        isLoading={historyLoading}
        currentId={result?.id}
      />
    </main>
  )
}

function InputPanel({
  text,
  onChange,
  onSubmit,
  isPending,
}: {
  text: string
  onChange: (v: string) => void
  onSubmit: () => void
  isPending: boolean
}) {
  const remaining = MAX_CHARS - text.length
  const overLimit = remaining < 0

  return (
    <div className="island-shell mb-8 rounded-2xl p-6">
      <label htmlFor="coach-input" className="island-kicker mb-2 block text-xs">
        Your text
      </label>
      <textarea
        id="coach-input"
        value={text}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Write a sentence or paragraph in English…"
        rows={6}
        className="w-full resize-none rounded-xl border border-(--line) bg-transparent px-3 py-2 text-sm text-(--sea-ink) outline-none placeholder:text-(--sea-ink-soft) focus:border-(--lagoon)"
      />
      <div className="mt-2 flex items-center justify-between gap-4">
        <span
          className={`text-xs ${overLimit ? 'text-red-500' : 'text-(--sea-ink-soft)'}`}
        >
          {remaining} characters remaining
        </span>
        <button
          onClick={onSubmit}
          disabled={!text.trim() || isPending || overLimit}
          className="island-shell rounded-xl px-4 py-2 text-sm font-semibold text-(--sea-ink) transition disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isPending ? (
            <span className="flex items-center gap-2">
              <span className="flex gap-0.5">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="h-1.5 w-1.5 animate-bounce rounded-full bg-(--lagoon)"
                    style={{ animationDelay: `${i * 120}ms` }}
                  />
                ))}
              </span>
              Reviewing…
            </span>
          ) : (
            'Get Feedback →'
          )}
        </button>
      </div>
    </div>
  )
}

function ResultPanel({
  result,
  onTryAnother,
}: {
  result: WritingFeedback
  onTryAnother: () => void
}) {
  return (
    <div className="mb-8 space-y-4">
      <div className="island-shell rounded-2xl p-6">
        <p className="island-kicker mb-2 text-xs">Revised version</p>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-(--sea-ink)">
          {result.revised}
        </p>
      </div>

      {result.suggestions.length > 0 && (
        <div className="island-shell rounded-2xl p-6">
          <p className="island-kicker mb-3 text-xs">Suggestions</p>
          <ul className="space-y-2">
            {result.suggestions.map((tip, i) => (
              <li key={i} className="flex gap-2 text-sm text-(--sea-ink)">
                <span className="mt-0.5 shrink-0 text-(--lagoon)">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        onClick={onTryAnother}
        className="island-shell rounded-xl px-4 py-2 text-sm font-semibold text-(--sea-ink) transition hover:opacity-80"
      >
        Try another →
      </button>
    </div>
  )
}

function HistorySection({
  history,
  isLoading,
  currentId,
}: {
  history: WritingFeedback[]
  isLoading: boolean
  currentId?: number
}) {
  const queryClient = useQueryClient()
  const visible = history.filter((t) => t.id !== currentId)

  const { mutate: deleteTurn } = useMutation({
    mutationFn: (id: number) => deleteWritingTurnFn({ data: { id } }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['writing-turns'] })
    },
  })

  if (isLoading) return null
  if (visible.length === 0) return null

  return (
    <section className="mt-8">
      <h2 className="island-kicker mb-4 text-xs">Past submissions</h2>
      <div className="space-y-3">
        {visible.map((turn) => (
          <HistoryItem key={turn.id} turn={turn} onDelete={deleteTurn} />
        ))}
      </div>
    </section>
  )
}

function HistoryItem({
  turn,
  onDelete,
}: {
  turn: WritingFeedback
  onDelete: (id: number) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const date = new Date(turn.createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })

  return (
    <div className="island-shell rounded-2xl">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between gap-3 p-4 text-left"
      >
        <span className="text-sm text-(--sea-ink)">{turn.original}</span>
        <span className="flex shrink-0 items-center gap-2 text-xs text-(--sea-ink-soft)">
          {date}
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            width="14"
            height="14"
            className={`transition-transform ${expanded ? 'rotate-180' : ''}`}
          >
            <path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
          </svg>
        </span>
      </button>

      {expanded && (
        <div className="border-t border-(--line) px-4 pb-4 pt-3 space-y-3">
          <div>
            <p className="island-kicker mb-1 text-xs">Revised</p>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-(--sea-ink)">
              {turn.revised}
            </p>
          </div>
          {turn.suggestions.length > 0 && (
            <div>
              <p className="island-kicker mb-1 text-xs">Suggestions</p>
              <ul className="space-y-1">
                {turn.suggestions.map((tip, i) => (
                  <li key={i} className="flex gap-2 text-sm text-(--sea-ink)">
                    <span className="mt-0.5 shrink-0 text-(--lagoon)">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="flex justify-end">
            <button
              onClick={() => dialogRef.current?.showModal()}
              className="flex h-7 w-7 items-center justify-center rounded-full text-(--sea-ink-soft) transition hover:bg-red-100 hover:text-red-500"
              title="Delete"
            >
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                width="16"
                height="16"
              >
                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <dialog
        ref={dialogRef}
        className="island-shell m-auto w-[calc(100%-2rem)] max-w-sm rounded-2xl p-6 outline-none backdrop:bg-black/30 backdrop:backdrop-blur-sm"
        onClick={(e) => {
          if (e.target === e.currentTarget) dialogRef.current?.close()
        }}
      >
        <h3 className="font-bold text-(--sea-ink)">Delete submission?</h3>
        <p className="mt-1 text-sm text-(--sea-ink-soft)">
          This submission and its feedback will be permanently deleted.
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
              onDelete(turn.id)
              dialogRef.current?.close()
            }}
            className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      </dialog>
    </div>
  )
}
