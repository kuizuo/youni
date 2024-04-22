import type * as ImagePicker from 'expo-image-picker'
import { Platform } from 'react-native'
import type { FileType } from '@server/modules/file/file.constant'
import { client } from './http/client'

export async function uploadImage(images: ImagePicker.ImagePickerAsset[], type: FileType) {
  const formData = new FormData()

  images.forEach((image, index) => {
    formData.append(`file${index}`, {
      type: image.mimeType,
      name: image.fileName,
      uri: Platform.OS === 'ios' ? image.uri.replace('file://', '') : image.uri,
    })
  })

  const data = await client.post(`/api/files/upload/multiple?type=${type}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }) as { url: string, name: string }[]

  return data
}
