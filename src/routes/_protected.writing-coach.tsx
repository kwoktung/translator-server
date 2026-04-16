import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected/writing-coach')({
  component: () => <Outlet />,
})
