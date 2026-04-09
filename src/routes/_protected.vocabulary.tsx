import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected/vocabulary')({
  component: () => <Outlet />,
})
