export interface InteractState {
  followingCount: number
  followerCount: number
  likesCount: number
  isFollowing: boolean
}

export type UserInfoWithFollow = UserInfo & {
  isFollowing: boolean
}
