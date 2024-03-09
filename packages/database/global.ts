declare global {
  namespace PrismaJson {
    type NoteImage = {
      src: string
      width?: number
      height?: number
    }

    type NoteImages = NoteImage[]
  }
}

export { }
