import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'

export interface SessionUser {
  id: string
  name: string
  email: string
}

export interface Session {
  session: object
  user: SessionUser
}

export const getSessionFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    const request = getRequest()
    const cookie = request.headers.get('cookie') ?? ''

    const response = await fetch(
      `${import.meta.env.VITE_AUTH_BASE_URL}/api/auth/get-session`,
      {
        headers: { cookie },
      },
    )

    if (!response.ok) return null

    const data = await response.json()

    return data as Session | null
  },
)
