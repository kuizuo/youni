type UserProfile = Awaited<
  ReturnType<import('./user.service').UserService['getProfile']>
>
