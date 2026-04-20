import { createServerFn } from '@tanstack/react-start'
import { getRequest, setResponseHeader } from '@tanstack/react-start/server'
import { fetchSessionWithCookies } from './fetch-session.server'

export const getSession = createServerFn().handler(async () => {
  const request = getRequest()
  const cookie = request.headers.get('cookie') ?? ''
  const { session, setCookies } = await fetchSessionWithCookies(cookie)

  for (const sc of setCookies) {
    setResponseHeader('Set-Cookie', sc)
  }

  return session
})
