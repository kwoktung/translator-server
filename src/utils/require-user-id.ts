import { getSession } from '#/utils/get-session'
import { UnauthorizedError } from '#/utils/errors'

export async function requireUserId(): Promise<string> {
  const session = await getSession()
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!session?.user?.id) throw new UnauthorizedError()
  return session.user.id
}
