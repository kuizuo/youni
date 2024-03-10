declare global {
  namespace PrismaJson {
    type NoteImage = {
      src: string
      width?: number
      height?: number
    }

    type NoteImages = NoteImage[]

    type Interact = {
      liked?: boolean
      likedCount?: number
      collected?: boolean
      collectedCount?: number
      commentCount?: number
    }
  }
}

export { }
