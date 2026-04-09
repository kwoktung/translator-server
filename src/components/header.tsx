import { Link } from '@tanstack/react-router'
import ThemeToggle from './theme-toggle'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-(--line) bg-(--header-bg) px-4 backdrop-blur-lg">
      <nav className="page-wrap flex items-center gap-4 py-3">
        <div className="flex items-center gap-6 ml-auto">
          <Link
            to="/tr"
            className="text-sm font-medium text-(--sea-ink-soft) hover:text-(--sea-ink) transition-colors"
          >
            Translate
          </Link>
          <Link
            to="/vocabulary"
            className="text-sm font-medium text-(--sea-ink-soft) hover:text-(--sea-ink) transition-colors"
          >
            Vocabulary
          </Link>
          <Link
            to="/writing-coach"
            className="hidden sm:block text-sm font-medium text-(--sea-ink-soft) hover:text-(--sea-ink) transition-colors"
          >
            Coach
          </Link>
          <Link
            to="/api-keys"
            className="hidden sm:block text-sm font-medium text-(--sea-ink-soft) hover:text-(--sea-ink) transition-colors"
          >
            API Keys
          </Link>
          <ThemeToggle />
        </div>
      </nav>
    </header>
  )
}
