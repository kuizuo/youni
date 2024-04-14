import type {
  PressableProps,
  TextProps,
  TouchableOpacityProps,
  ViewProps,
} from 'react-native'
import {
  Pressable as PressableOg,
  Text as TextOg,
  TouchableOpacity as TouchableOpacityOg,
  View as ViewOg,
} from 'react-native'
import { remapProps } from 'nativewind'

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

export function TouchableOpacity({ children, className, ...props }: TouchableOpacityProps) {
  const defaultClass = ``

  return (
    <TouchableOpacityOg
      className={`${defaultClass} ${className}`}
      {...props}
    >
      {children}
    </TouchableOpacityOg>
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
  const defaultClass = `text-black dark:text-white`
  return (
    <TextOg
      className={`${defaultClass} ${className}`}
      // style={tw.style(tw`text-black dark:text-white`, style)}
      {...props}
    >
      {children}
    </TextOg>
  )
}

remapProps(Text, { className: 'style' })
