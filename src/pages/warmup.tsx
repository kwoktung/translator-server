import { useMemo, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { client, json } from '#/utils/api-client'
import { useAudioPlay } from '#/hooks/use-audio-play'
import type { VocabularyEntry } from '#/db/schema'

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function VocabularyWarmupPage() {
  const { data: words = [], isLoading } = useQuery({
    queryKey: ['vocabulary', 'warmup'],
    queryFn: async () => {
      const data = await json(
        client.api.vocabulary.$get({ query: { limit: '1000' } }),
      )
      return data.items
    },
  })

  const [sessionKey, setSessionKey] = useState(0)
  const shuffled = useMemo(() => shuffle(words), [words, sessionKey])

  const [currentIndex, setCurrentIndex] = useState(0)
  const [dragY, setDragY] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [isExiting, setIsExiting] = useState(false)
  const [revealed, setRevealed] = useState(false)

  const startYRef = useRef(0)

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (isExiting) return
    startYRef.current = e.clientY
    setIsDragging(true)
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!isDragging || isExiting) return
    const delta = e.clientY - startYRef.current
    setDragY(Math.min(0, delta))
  }

  function handlePointerUp() {
    if (!isDragging) return
    const dy = dragY
    setIsDragging(false)
    // if (dy < -80) {
    if (dy < -40) {
      setIsExiting(true)
      setTimeout(() => {
        setCurrentIndex((i) => i + 1)
        setDragY(0)
        setRevealed(false)
        setIsExiting(false)
      }, 300)
    } else {
      requestAnimationFrame(() => setDragY(0))
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <span className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-2 w-2 animate-bounce rounded-full bg-[var(--lagoon)]"
              style={{ animationDelay: `${i * 120}ms` }}
            />
          ))}
        </span>
      </div>
    )
  }

  if (shuffled.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-8">
        <p className="text-center text-(--sea-ink-soft)">
          No words to practice yet.
        </p>
        <Link
          to="/vocabulary"
          className="island-shell rounded-xl px-5 py-2.5 text-sm font-semibold text-(--sea-ink)"
        >
          Go to Vocabulary
        </Link>
      </div>
    )
  }

  const isDone = currentIndex >= shuffled.length
  const dragProgress = Math.min(1, -Math.min(0, dragY) / 80)

  return (
    <div className="relative h-full w-full">
      <Link
        to="/vocabulary"
        className="absolute left-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full text-(--sea-ink-soft) transition hover:bg-white/30"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
          <path d="M19 11H7.83l4.88-4.88c.39-.39.39-1.03 0-1.42-.39-.39-1.02-.39-1.41 0l-6.59 6.59c-.39.39-.39 1.02 0 1.41l6.59 6.59c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41L7.83 13H19c.55 0 1-.45 1-1s-.45-1-1-1z" />
        </svg>
      </Link>

      {isDone ? (
        <CompletionCard
          count={shuffled.length}
          onRestart={() => {
            setCurrentIndex(0)
            setRevealed(false)
            setSessionKey((k) => k + 1)
          }}
        />
      ) : (
        <>
          {currentIndex + 1 < shuffled.length && (
            <div
              className="absolute inset-0 p-4 sm:p-12"
              style={{
                transform: isExiting
                  ? 'translateY(0px) scale(1)'
                  : `translateY(${12 * (1 - dragProgress)}px) scale(${0.95 + dragProgress * 0.05})`,
                transformOrigin: 'top center',
                transition: isDragging ? 'none' : 'transform 0.3s ease',
                opacity: isExiting ? 1 : 0.6,
                pointerEvents: 'none',
              }}
            >
              <WordCard
                entry={shuffled[currentIndex + 1]}
                revealed={false}
                onReveal={() => {}}
              />
            </div>
          )}

          <div
            key={currentIndex}
            className="absolute inset-0 select-none p-4 sm:p-12"
            style={{
              transform: isExiting
                ? 'translateY(-110vh)'
                : `translateY(${dragY}px)`,
              transition: isDragging
                ? 'none'
                : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              cursor: isDragging ? 'grabbing' : 'grab',
              zIndex: 1,
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          >
            <WordCard
              entry={shuffled[currentIndex]}
              revealed={revealed}
              onReveal={() => setRevealed(true)}
            />
          </div>
        </>
      )}
    </div>
  )
}

function WordCard({
  entry,
  revealed,
  onReveal,
}: {
  entry: VocabularyEntry
  revealed: boolean
  onReveal: () => void
}) {
  const hasReveal = Boolean(entry.meaning || entry.example)
  const { loading, playing, play } = useAudioPlay()
  const isActive = loading || playing

  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const titleStartPos = useRef({ x: 0, y: 0 })

  function cancelLongPress() {
    if (longPressTimer.current !== null) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }

  function handleTitlePointerDown(e: React.PointerEvent<HTMLHeadingElement>) {
    e.stopPropagation()
    titleStartPos.current = { x: e.clientX, y: e.clientY }
    longPressTimer.current = setTimeout(() => {
      longPressTimer.current = null
      navigator.clipboard.writeText(entry.word)
    }, 500)
  }

  function handleTitlePointerMove(e: React.PointerEvent<HTMLHeadingElement>) {
    e.stopPropagation()
    const dx = e.clientX - titleStartPos.current.x
    const dy = e.clientY - titleStartPos.current.y
    if (Math.hypot(dx, dy) > 10) cancelLongPress()
  }

  function handleTitlePointerUp(e: React.PointerEvent<HTMLHeadingElement>) {
    e.stopPropagation()
    cancelLongPress()
  }

  return (
    <div className="island-shell flex h-full flex-col rounded-3xl p-8">
      <div className="flex flex-1 flex-col items-center justify-center gap-4">
        <h1
          className="display-title wrap-break-word text-center text-5xl font-bold text-(--sea-ink) sm:text-6xl"
          onPointerDown={handleTitlePointerDown}
          onPointerMove={handleTitlePointerMove}
          onPointerUp={handleTitlePointerUp}
          onPointerCancel={handleTitlePointerUp}
        >
          {entry.word}
        </h1>
        <div className="flex items-center gap-3">
          {entry.phonetic && (
            <span className="text-lg text-(--sea-ink-soft)">
              {entry.phonetic}
            </span>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation()
              if (!isActive) play(`/audio/w/${encodeURIComponent(entry.word)}`)
            }}
            disabled={isActive}
            title="Listen"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--lagoon)] text-white shadow-sm transition hover:bg-[var(--lagoon-deep)] disabled:opacity-70"
          >
            {isActive ? (
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                width="16"
                height="16"
              >
                <rect x="6" y="5" width="4" height="14" rx="1" />
                <rect x="14" y="5" width="4" height="14" rx="1" />
              </svg>
            ) : (
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                width="16"
                height="16"
              >
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      <div className="my-2 h-px w-full bg-[var(--line)]" />

      <div
        className="flex flex-1 flex-col items-center justify-center gap-4"
        onClick={!revealed && hasReveal ? onReveal : undefined}
      >
        {!hasReveal ? (
          <span className="text-sm opacity-40 text-(--sea-ink-soft)">—</span>
        ) : revealed ? (
          <div className="flex max-w-sm flex-col items-center gap-3 rise-in">
            {entry.meaning && (
              <p className="text-center text-lg leading-relaxed text-(--sea-ink)">
                {entry.meaning}
              </p>
            )}
            {entry.example && (
              <p className="text-center text-sm leading-relaxed italic text-(--sea-ink-soft)">
                {entry.example}
              </p>
            )}
          </div>
        ) : (
          <button className="rounded-xl border border-[var(--line)] px-6 py-3 text-sm text-(--sea-ink-soft)">
            tap to reveal
          </button>
        )}
      </div>

      <div
        className="mt-4 flex justify-center transition-opacity duration-300"
        style={{ opacity: revealed ? 1 : 0 }}
      >
        <span className="flex items-center gap-1 text-xs opacity-40 text-(--sea-ink-soft)">
          <svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12">
            <path d="M7.41 15.41 12 10.83l4.59 4.58L18 14l-6-6-6 6z" />
          </svg>
          swipe up
        </span>
      </div>
    </div>
  )
}

function CompletionCard({
  count,
  onRestart,
}: {
  count: number
  onRestart: () => void
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center p-8">
      <div className="island-shell w-full max-w-sm rounded-3xl p-10 text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--lagoon)] text-white">
            <svg viewBox="0 0 24 24" fill="currentColor" width="32" height="32">
              <path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
            </svg>
          </div>
        </div>
        <h2 className="display-title mb-2 text-3xl font-bold text-(--sea-ink)">
          All caught up!
        </h2>
        <p className="text-(--sea-ink-soft)">
          You reviewed {count} {count === 1 ? 'word' : 'words'}
        </p>

        <div className="mt-8 flex flex-col gap-3">
          <button
            onClick={onRestart}
            className="island-shell w-full rounded-xl px-6 py-3 font-semibold text-(--sea-ink)"
          >
            Practice again
          </button>
          <Link
            to="/vocabulary"
            className="text-sm text-(--lagoon-deep) hover:underline"
          >
            Back to Vocabulary
          </Link>
        </div>
      </div>
    </div>
  )
}
