import { useState } from 'react'
import { signInWithGoogle } from '#/utils/auth'

export function HomePage() {
  const [isLoading, setIsLoading] = useState(false)

  const handleGetStarted = async () => {
    setIsLoading(true)
    try {
      await signInWithGoogle()
    } catch {
      setIsLoading(false)
    }
  }

  return (
    <main className="flex min-h-[calc(100vh-8rem)] items-center justify-center">
      <div className="flex flex-col items-center gap-8 text-center">
        <h1 className="display-title text-5xl font-bold text-(--sea-ink)">
          Translator
        </h1>
        <p className="max-w-md text-(--sea-ink-soft)">
          Translate words and sentences instantly with AI-powered accuracy.
        </p>
        <button
          onClick={handleGetStarted}
          disabled={isLoading}
          className="island-shell flex cursor-pointer items-center gap-2 rounded-xl px-8 py-3 text-sm font-semibold text-(--sea-ink) transition-colors duration-200 hover:border-(--lagoon) hover:bg-(--lagoon) hover:text-white disabled:cursor-default disabled:opacity-70 disabled:hover:bg-transparent disabled:hover:text-(--sea-ink)"
        >
          {isLoading ? (
            <>
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Getting Started…
            </>
          ) : (
            'Get Started'
          )}
        </button>
      </div>
    </main>
  )
}
