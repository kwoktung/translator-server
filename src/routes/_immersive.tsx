import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { sessionQueryOptions } from '#/utils/get-session'

export const Route = createFileRoute('/_immersive')({
  loader: async ({ context: { queryClient } }) => {
    const session = await queryClient.ensureQueryData(sessionQueryOptions)
    if (!session) throw redirect({ to: '/' })
  },
  component: () => (
    <div className="fixed inset-0 overflow-hidden touch-none overscroll-none">
      <Outlet />
    </div>
  ),
})
