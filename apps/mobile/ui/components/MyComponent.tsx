import type { TextProps } from 'react-native'
import { Text as TextOg, View as ViewOg } from 'react-native'
import tw from '@/utils/tw'

export function View({ children, style, ...props }: any) {
  return (
    <ViewOg
      style={tw.style(style)}
      {...props}
    >
      {children}
    </ViewOg>
  )
}
export function Text({ children, style, ...props }: TextProps) {
  return (
    <TextOg
      // @ts-expect-error
      style={tw.style(tw`text-black dark:text-white`, style)}
      {...props}
    >
      {children}
    </TextOg>
  )
}
