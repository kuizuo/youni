export type UserProfile = Awaited<
  ReturnType<import('./user.service').UserService['getProfile']>
>

export type User = Awaited<
  ReturnType<import('./user.service').UserService['getUserById']>
>
