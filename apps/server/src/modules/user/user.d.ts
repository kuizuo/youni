export type UserProfile = Awaited<
  ReturnType<import('./user.service').UserService['getProfile']>
>

export type UserInfo = Awaited<
  ReturnType<import('./user.public.service').UserPublicService['getUserById']>
>
