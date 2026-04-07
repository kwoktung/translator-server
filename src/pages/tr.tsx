import { useRef, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { sentenceTranslateFn } from '#/actions/translate-sentence'
import { speakText } from '#/utils/tts'

type Lang = 'en' | 'zh'

const LANG_LABEL: Record<Lang, string> = { en: 'English', zh: 'Chinese' }
const LANG_SHORT: Record<Lang, string> = { en: 'EN', zh: 'ZH' }

function SpeakButton({ text, disabled }: { text: string; disabled?: boolean }) {
  const [playing, setPlaying] = useState(false)

  async function handleClick() {
    if (playing || !text) return
    setPlaying(true)
    try {
      await speakText(text)
    } finally {
      setPlaying(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={disabled || playing || !text}
      title="Listen"
      className="flex h-8 w-8 items-center justify-center rounded-full text-(--sea-ink-soft) transition hover:bg-[var(--link-bg-hover)] hover:text-[var(--lagoon-deep)] disabled:opacity-30"
    >
      {playing ? (
        <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
          <rect x="6" y="5" width="4" height="14" rx="1" />
          <rect x="14" y="5" width="4" height="14" rx="1" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
        </svg>
      )}
    </button>
  )
}

export function TranslatePage() {
  const [source, setSource] = useState<Lang>('en')
  const [target, setTarget] = useState<Lang>('zh')
  const [inputText, setInputText] = useState('')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const {
    mutate: translate,
    data: result,
    isPending,
    error,
    reset,
  } = useMutation({
    mutationFn: ({ text, src, tgt }: { text: string; src: Lang; tgt: Lang }) =>
      sentenceTranslateFn({ data: { text, source: src, target: tgt } }),
  })

  function scheduleTranslate(text: string, src: Lang, tgt: Lang) {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    const trimmed = text.trim()
    if (!trimmed) {
      reset()
      return
    }
    debounceRef.current = setTimeout(
      () => translate({ text: trimmed, src, tgt }),
      600,
    )
  }

  function handleInput(text: string) {
    setInputText(text)
    scheduleTranslate(text, source, target)
  }

  function handleSwap() {
    const newSrc = target
    const newTgt = source
    setSource(newSrc)
    setTarget(newTgt)
    if (inputText.trim())
      translate({ text: inputText.trim(), src: newSrc, tgt: newTgt })
  }

  function handleClear() {
    setInputText('')
    reset()
  }

  function handleLangChange(side: 'source' | 'target', lang: Lang) {
    if (side === 'source') {
      if (lang === target) return handleSwap()
      setSource(lang)
      if (inputText.trim())
        translate({ text: inputText.trim(), src: lang, tgt: target })
    } else {
      if (lang === source) return handleSwap()
      setTarget(lang)
      if (inputText.trim())
        translate({ text: inputText.trim(), src: source, tgt: lang })
    }
  }

  const outputText = result?.translatedText ?? ''
  const errorMessage = error ? 'Translation failed. Please try again.' : null

  return (
    <main className="page-wrap px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="display-title text-3xl font-bold text-(--sea-ink) sm:text-4xl">
          Translate
        </h1>
      </div>

      {/* Card */}
      <div className="island-shell overflow-hidden rounded-2xl">
        {/* Language bar */}
        <div className="flex items-center gap-1 border-b border-(--line) px-3 py-2.5 sm:gap-2 sm:px-4 sm:py-3">
          <LangTabs
            value={source}
            other={target}
            onChange={(l) => handleLangChange('source', l)}
          />

          <button
            onClick={handleSwap}
            title="Swap languages"
            className="mx-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-(--sea-ink-soft) transition hover:bg-[var(--link-bg-hover)] hover:text-[var(--lagoon-deep)]"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
              <path d="M6.99 11 3 15l3.99 4v-3H14v-2H6.99v-3zM21 9l-3.99-4v3H10v2h7.01v3L21 9z" />
            </svg>
          </button>

          <LangTabs
            value={target}
            other={source}
            onChange={(l) => handleLangChange('target', l)}
          />
        </div>

        {/* Panels */}
        <div className="grid grid-cols-1 divide-y divide-(--line) sm:grid-cols-2 sm:divide-x sm:divide-y-0">
          {/* Source panel */}
          <div className="flex min-h-52 flex-col p-4">
            <textarea
              value={inputText}
              onChange={(e) => handleInput(e.target.value)}
              placeholder={`Enter ${LANG_LABEL[source]} text…`}
              className="flex-1 resize-none bg-transparent text-base leading-relaxed text-(--sea-ink) placeholder:text-[var(--sea-ink-soft)]/50 outline-none"
              rows={6}
            />
            <div className="mt-3 flex items-center justify-between">
              {source === 'en' && <SpeakButton text={inputText} />}
              {source !== 'en' && <span />}
              <div className="flex items-center gap-2">
                <span className="text-xs text-(--sea-ink-soft)/60">
                  {inputText.length}/500
                </span>
                {inputText && (
                  <button
                    onClick={handleClear}
                    className="flex h-7 w-7 items-center justify-center rounded-full text-(--sea-ink-soft) transition hover:bg-[var(--link-bg-hover)] hover:text-[var(--sea-ink)]"
                    title="Clear"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      width="16"
                      height="16"
                    >
                      <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Target panel */}
          <div className="flex min-h-52 flex-col bg-[rgba(79,184,178,0.04)] p-4">
            {isPending ? (
              <div className="flex flex-1 items-center justify-center">
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
            ) : errorMessage ? (
              <p className="text-sm text-red-500">{errorMessage}</p>
            ) : result ? (
              <>
                <p className="flex-1 text-base leading-relaxed text-(--sea-ink)">
                  {result.translatedText}
                </p>
                {target === 'en' && (
                  <div className="mt-3 flex items-center">
                    <SpeakButton text={outputText} />
                  </div>
                )}
              </>
            ) : (
              <p className="flex-1 text-base text-(--sea-ink-soft)/40">
                Translation will appear here
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}

function LangTabs({
  value,
  other,
  onChange,
}: {
  value: Lang
  other: Lang
  onChange: (l: Lang) => void
}) {
  const langs: Lang[] = ['en', 'zh']
  return (
    <div className="flex flex-1 gap-1">
      {langs.map((l) => (
        <button
          key={l}
          onClick={() => onChange(l)}
          className={[
            'rounded-full text-sm font-semibold transition',
            'px-2.5 py-1.5 sm:px-4',
            value === l
              ? 'bg-(--lagoon) text-white shadow-sm'
              : 'text-(--sea-ink-soft) hover:bg-(--link-bg-hover) hover:text-(--sea-ink)',
          ].join(' ')}
        >
          <span className="sm:hidden">{LANG_SHORT[l]}</span>
          <span className="hidden sm:inline">{LANG_LABEL[l]}</span>
        </button>
      ))}
    </div>
  )
}
