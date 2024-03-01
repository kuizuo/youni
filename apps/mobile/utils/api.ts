import { replaceLocalhost } from "./localhost.native"

export const getApiUrl = () => {
  const apiUrl = `${process.env.EXPO_PUBLIC_API_URL}`
  return replaceLocalhost(apiUrl)
}
