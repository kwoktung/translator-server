import { createIsomorphicFn } from '@tanstack/react-start'
import { authClient } from '#/utils/auth.client'

export const signInWithGoogle = createIsomorphicFn()
  .client(() => {
    authClient.signIn.social({
      provider: 'google',
      callbackURL: `${window.location.origin}/tr`,
    })
  })
  .server(() => {})
