import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import type { PreviewFeedback } from '#/actions/writing-coach'
import { client, json } from '#/utils/api-client'

const MAX_CHARS = 2000

export function WritingCoachPage() {
  const [text, setText] = useState('')
  const [result, setResult] = useState<PreviewFeedback | null>(null)
  const [originalText, setOriginalText] = useState('')
  const [saved, setSaved] = useState(false)

  const { mutate, isPending } = useMutation({
    mutationFn: (input: string) =>
      json(
        client.api['writing-coach'].preview.$post({ json: { text: input } }),
      ),
    onSuccess: (data) => {
      setResult(data)
      setText('')
    },
  })

  function handleSubmit() {
    if (!text.trim() || isPending) return
    const trimmed = text.trim()
    setOriginalText(trimmed)
    setSaved(false)
    mutate(trimmed)
  }

  function handleTryAnother() {
    setResult(null)
    setSaved(false)
  }

  return (
    <main className="page-wrap px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="display-title text-3xl font-bold text-(--sea-ink) sm:text-4xl">
          Writing Coach
        </h1>
        <Link
          to="/writing-coach/history"
          className="text-sm font-medium text-(--sea-ink-soft) transition hover:text-(--sea-ink)"
        >
          History →
        </Link>
      </div>

      {result ? (
        <ResultPanel
          result={result}
          originalText={originalText}
          saved={saved}
          onSaved={() => setSaved(true)}
          onTryAnother={handleTryAnother}
        />
      ) : (
        <InputPanel
          text={text}
          onChange={setText}
          onSubmit={handleSubmit}
          isPending={isPending}
        />
      )}
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

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSubmit()
    }
  }

  return (
    <div className="island-shell mb-8 rounded-2xl p-6">
      <label htmlFor="coach-input" className="island-kicker mb-2 block text-xs">
        Your text
      </label>
      <textarea
        id="coach-input"
        value={text}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Write a sentence or paragraph in English…"
        rows={6}
        className="w-full resize-none rounded-xl border border-(--line) bg-transparent px-3 py-2 text-sm text-(--sea-ink) outline-none placeholder:text-(--sea-ink-soft) focus:border-(--lagoon)"
      />
      <div className="mt-2 flex items-center justify-between gap-4">
        <span
          className={`text-xs tabular-nums ${overLimit ? 'text-red-500' : 'text-(--sea-ink-soft)'}`}
        >
          <span className="inline-block text-right">{remaining}</span>{' '}
          characters remaining
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
  originalText,
  saved,
  onSaved,
  onTryAnother,
}: {
  result: PreviewFeedback
  originalText: string
  saved: boolean
  onSaved: () => void
  onTryAnother: () => void
}) {
  const { mutate: save, isPending: isSaving } = useMutation({
    mutationFn: () =>
      json(
        client.api['writing-coach'].turns.$post({
          json: { text: originalText },
        }),
      ),
    onSuccess: () => onSaved(),
  })

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

      <div className="flex items-center gap-3">
        <button
          onClick={onTryAnother}
          className="island-shell rounded-xl px-4 py-2 text-sm font-semibold text-(--sea-ink) transition hover:opacity-80"
        >
          Try another →
        </button>
        {saved ? (
          <span className="text-sm font-medium text-(--lagoon)">Saved ✓</span>
        ) : (
          <button
            onClick={() => save()}
            disabled={isSaving}
            className="island-shell rounded-xl px-4 py-2 text-sm font-semibold text-(--sea-ink) transition disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isSaving ? 'Saving…' : 'Add to History'}
          </button>
        )}
      </div>
    </div>
  )
}
