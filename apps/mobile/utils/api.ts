import { replaceLocalhost } from './localhost.native'

export function getApiUrl() {
  const apiUrl = `${process.env.EXPO_PUBLIC_API_URL}`
  return apiUrl
  return replaceLocalhost(apiUrl)
}
