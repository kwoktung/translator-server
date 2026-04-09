import { useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createApiKeyFn,
  deleteApiKeyFn,
  listApiKeysFn,
} from '#/actions/api-keys'
import type { ApiKeyItem } from '#/actions/api-keys'

export function ApiKeysPage() {
  const [nameInput, setNameInput] = useState('')
  const queryClient = useQueryClient()

  const { data: keys, isLoading } = useQuery({
    queryKey: ['api-keys'],
    queryFn: () => listApiKeysFn(),
  })

  const { mutate: createKey, isPending: isCreating } = useMutation({
    mutationFn: (name: string) => createApiKeyFn({ data: { name } }),
    onSuccess: () => {
      setNameInput('')
      void queryClient.invalidateQueries({ queryKey: ['api-keys'] })
    },
  })

  const { mutate: deleteKey } = useMutation({
    mutationFn: (id: number) => deleteApiKeyFn({ data: { id } }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['api-keys'] })
    },
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const name = nameInput.trim()
    if (!name || isCreating) return
    createKey(name)
  }

  return (
    <main className="page-wrap px-4 py-6">
      <h1 className="display-title mb-6 text-3xl font-bold text-(--sea-ink) sm:text-4xl">
        API Keys
      </h1>

      <div className="island-shell mb-8 rounded-2xl p-6">
        <p className="island-kicker mb-3 text-xs">Create new key</p>
        <form
          onSubmit={handleSubmit}
          className="flex gap-2 flex-col sm:flex-row"
        >
          <input
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="Key name (e.g. My Script)"
            maxLength={100}
            className="flex-1 rounded-xl border border-(--line) bg-transparent px-3 py-2 text-sm text-(--sea-ink) outline-none placeholder:text-(--sea-ink-soft) focus:border-(--lagoon)"
          />
          <button
            type="submit"
            disabled={!nameInput.trim() || isCreating}
            className="island-shell rounded-xl px-4 py-2 text-sm font-semibold text-(--sea-ink) transition disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isCreating ? 'Creating…' : 'Create'}
          </button>
        </form>
      </div>

      {!isLoading && (keys?.length ?? 0) > 0 && (
        <section>
          <h2 className="island-kicker mb-4 text-xs">Your keys</h2>
          <div className="space-y-2">
            {keys!.map((k) => (
              <KeyItem key={k.id} item={k} onDelete={deleteKey} />
            ))}
          </div>
        </section>
      )}

      {!isLoading && (keys?.length ?? 0) === 0 && (
        <p className="text-sm text-(--sea-ink-soft)">
          No API keys yet. Create one above.
        </p>
      )}
    </main>
  )
}

function KeyItem({
  item,
  onDelete,
}: {
  item: ApiKeyItem
  onDelete: (id: number) => void
}) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [copied, setCopied] = useState(false)
  const [curlCopied, setCurlCopied] = useState(false)
  const [showCurl, setShowCurl] = useState(false)
  const date = new Date(item.createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  const maskedKey = `${item.key.slice(0, 6)}${'•'.repeat(10)}${item.key.slice(-4)}`

  const sampleText =
    'never show plain api key; but when the user copy curl command to use plain api key to compose command string'

  const curlCommand = [
    `curl -X POST ${window.location.origin}/api/writing-coach \\`,
    `  -H "Authorization: Bearer ${item.key}" \\`,
    `  -H "Content-Type: application/json" \\`,
    `  -d '{"text": "${sampleText}"}'`,
  ].join('\n')

  const curlCommandDisplay = [
    `curl -X POST ${window.location.origin}/api/writing-coach \\`,
    `  -H "Authorization: Bearer ${maskedKey}" \\`,
    `  -H "Content-Type: application/json" \\`,
    `  -d '{"text": "${sampleText}"}'`,
  ].join('\n')

  async function handleCopy() {
    await navigator.clipboard.writeText(item.key)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleCopyCurl() {
    await navigator.clipboard.writeText(curlCommand)
    setCurlCopied(true)
    setTimeout(() => setCurlCopied(false), 2000)
  }

  return (
    <div className="island-shell rounded-2xl px-5 py-4">
      {/* Row 1: name + date */}
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-semibold text-(--sea-ink)">{item.name}</p>
        <p className="shrink-0 text-xs text-(--sea-ink-soft)">{date}</p>
      </div>

      {/* Row 2: key + copy | curl toggle | delete */}
      <div className="mt-3 flex items-center justify-between gap-3 border-t border-(--line) pt-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="truncate font-mono text-xs text-(--sea-ink-soft)">
            {maskedKey}
          </span>
          <button
            onClick={handleCopy}
            className="shrink-0 rounded-md px-2 py-0.5 text-xs font-medium text-(--lagoon) ring-1 ring-(--lagoon)/30 transition hover:ring-(--lagoon)/60"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <button
            onClick={() => setShowCurl((v) => !v)}
            className="shrink-0 rounded-md px-2 py-0.5 text-xs font-medium text-(--sea-ink-soft) ring-1 ring-(--line) transition hover:ring-(--sea-ink-soft)/40"
          >
            cURL
          </button>
        </div>
        <button
          onClick={() => dialogRef.current?.showModal()}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-(--sea-ink-soft) transition hover:bg-red-50 hover:text-red-500"
          title="Delete"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15">
            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
          </svg>
        </button>
      </div>

      {/* Row 3: cURL sample (collapsible) */}
      {showCurl && (
        <div className="mt-3 border-t border-(--line) pt-3">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs text-(--sea-ink-soft)">
              Sample request
            </span>
            <button
              onClick={handleCopyCurl}
              className="shrink-0 rounded-md px-2 py-0.5 text-xs font-medium text-(--lagoon) ring-1 ring-(--lagoon)/30 transition hover:ring-(--lagoon)/60"
            >
              {curlCopied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <pre className="overflow-x-auto rounded-xl bg-(--line)/40 px-4 py-3 font-mono text-xs leading-relaxed text-(--sea-ink-soft) whitespace-pre">
            {curlCommandDisplay}
          </pre>
        </div>
      )}

      <dialog
        ref={dialogRef}
        className="island-shell m-auto w-[calc(100%-2rem)] max-w-sm rounded-2xl p-6 outline-none backdrop:bg-black/30 backdrop:backdrop-blur-sm"
        onClick={(e) => {
          if (e.target === e.currentTarget) dialogRef.current?.close()
        }}
      >
        <h3 className="font-bold text-(--sea-ink)">
          Delete &quot;{item.name}&quot;?
        </h3>
        <p className="mt-1 text-sm text-(--sea-ink-soft)">
          This key will stop working immediately and cannot be recovered.
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
              onDelete(item.id)
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
