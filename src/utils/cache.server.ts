async function makeCacheKey(namespace: string, key: string): Promise<Request> {
  const buf = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(key),
  )
  const hash = Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
  return new Request(`https://cache.internal/${namespace}/${hash}`)
}

export async function withJsonCache<T>({
  namespace,
  key,
  fn,
  ttl,
}: {
  namespace: string
  key: string
  fn: () => Promise<T>
  ttl: number
}): Promise<T> {
  const cache = caches.default
  const cacheKey = await makeCacheKey(namespace, key)

  const cached = await cache.match(cacheKey)
  if (cached) return cached.json()

  const data = await fn()

  await cache.put(
    cacheKey,
    new Response(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': `max-age=${ttl}`,
      },
    }),
  )

  return data
}

export async function withBinaryCache({
  namespace,
  key,
  fn,
  ttl,
  contentType,
}: {
  namespace: string
  key: string
  fn: () => Promise<ReadableStream>
  ttl: number
  contentType: string
}): Promise<ReadableStream> {
  const cache = caches.default
  const cacheKey = await makeCacheKey(namespace, key)

  const cached = await cache.match(cacheKey)
  if (cached) return cached.body!

  const stream = await fn()
  const buffer = await new Response(stream).arrayBuffer()

  await cache.put(
    cacheKey,
    new Response(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': `max-age=${ttl}`,
      },
    }),
  )

  return new Response(buffer).body!
}
