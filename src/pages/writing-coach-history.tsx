import { useRef, useState } from 'react'
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import type { WritingFeedback } from '#/actions/writing-coach'
import { client, json } from '#/utils/api-client'

type Period = 'today' | 'week' | 'month' | 'all'

function getFromTimestamp(period: Period): number | undefined {
  if (period === 'all') return undefined
  const now = new Date()
  if (period === 'today')
    return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  if (period === 'week') {
    const day = now.getDay()
    const diff = day === 0 ? 6 : day - 1 // days since Monday
    return new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - diff,
    ).getTime()
  }
  return new Date(now.getFullYear(), now.getMonth(), 1).getTime()
}

export function WritingCoachHistoryPage() {
  const [period, setPeriod] = useState<Period>('all')
  const queryClient = useQueryClient()

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ['writing-turns', period],
      queryFn: ({ pageParam }) => {
        const query: Record<string, string> = {}
        if (pageParam != null) query.cursor = String(pageParam)
        const from = getFromTimestamp(period)
        if (from !== undefined) query.from = String(from)
        return json(client.api['writing-coach'].turns.$get({ query }))
      },
      initialPageParam: null as number | null,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    })

  const { mutate: deleteTurn } = useMutation({
    mutationFn: (id: number) =>
      json(
        client.api['writing-coach'].turns[':id'].$delete({
          param: { id: String(id) },
        }),
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['writing-turns'] })
    },
  })

  const items = data?.pages.flatMap((p) => p.items) ?? []

  return (
    <main className="page-wrap px-4 py-6">
      <div className="mb-4">
        <Link
          to="/writing-coach"
          className="text-sm text-(--sea-ink-soft) transition hover:text-(--sea-ink)"
        >
          ← Writing Coach
        </Link>
      </div>

      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="display-title text-3xl font-bold text-(--sea-ink) sm:text-4xl">
          History
        </h1>
        <PeriodFilter value={period} onChange={setPeriod} />
      </div>

      {isLoading ? null : items.length === 0 ? (
        <p className="text-sm text-(--sea-ink-soft)">
          No submissions for this period.
        </p>
      ) : (
        <div className="space-y-3">
          {items.map((turn) => (
            <HistoryItem key={turn.id} turn={turn} onDelete={deleteTurn} />
          ))}
          {hasNextPage && (
            <button
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="mt-3 w-full rounded-xl island-shell px-4 py-2 text-sm text-(--sea-ink-soft) transition hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isFetchingNextPage ? 'Loading…' : 'Load more'}
            </button>
          )}
        </div>
      )}
    </main>
  )
}

function PeriodFilter({
  value,
  onChange,
}: {
  value: Period
  onChange: (p: Period) => void
}) {
  const options: { label: string; value: Period }[] = [
    { label: 'Today', value: 'today' },
    { label: 'This week', value: 'week' },
    { label: 'This month', value: 'month' },
    { label: 'All', value: 'all' },
  ]

  return (
    <div className="flex gap-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`rounded-xl px-3 py-1.5 text-xs font-medium transition ${
            value === opt.value
              ? 'island-shell text-(--sea-ink)'
              : 'text-(--sea-ink-soft) hover:text-(--sea-ink)'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
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
