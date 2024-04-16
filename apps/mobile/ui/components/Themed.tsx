import type {
  PressableProps,
  TextProps,
  ViewProps,
} from 'react-native'
import {
  Pressable as PressableOg,
  Text as TextOg,
  View as ViewOg,
} from 'react-native'

export function View({ children, className, ...props }: ViewProps) {
  const defaultClass = ``

  return (
    <ViewOg
      className={`${defaultClass} ${className}`}
      {...props}
    >
      {children}
    </ViewOg>
  )
}

export function Pressable({ children, className, ...props }: PressableProps) {
  const defaultClass = ``
  return (
    <PressableOg
      className={`${defaultClass} ${className}`}
      {...props}
    >
      {children}
    </PressableOg>
  )
}

export function Text({ children, className, style, ...props }: TextProps) {
  return (
    <TextOg
      className={`text-black  ${className}`}
      {...props}
    >
      {children}
    </TextOg>
  )
}
