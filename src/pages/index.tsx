import { signInWithGoogle } from '#/utils/auth'

export function HomePage() {
  const handleGetStarted = () => {
    signInWithGoogle()
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
          className="island-shell rounded-xl px-8 py-3 text-sm font-semibold text-(--sea-ink) hover:border-[var(--lagoon)]"
        >
          Get Started
        </button>
      </div>
    </main>
  )
}
