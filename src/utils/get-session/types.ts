export interface SessionUser {
  id: string
  name: string
  email: string
}

export interface Session {
  session: object
  user: SessionUser
}
