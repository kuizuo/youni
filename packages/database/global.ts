declare global {
  namespace PrismaJson {
    type Image = {
      name?: string
      src: string
      width?: number
      height?: number
    }

    type Images = Image[]

    type Interact = {
      liked?: boolean
      likedCount?: number
      collected?: boolean
      collectedCount?: number
      commentCount?: number
    }

    type NotificationSource = {
      [key: string]: any
    }
  }
}

export { }
