import ThemeToggle from './theme-toggle'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-(--line) bg-(--header-bg) px-4 backdrop-blur-lg">
      <nav className="page-wrap flex items-center gap-4 py-3">
        <div className="ml-auto">
          <ThemeToggle />
        </div>
      </nav>
    </header>
  )
}
