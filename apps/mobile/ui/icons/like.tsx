import React, { memo } from 'react'
import { IconProps, themed } from '@tamagui/helpers-icon'
import {
  Path,
  Svg,
} from 'react-native-svg'

function Icon(props) {
  const { color = 'black', size = 24, ...otherProps } = props
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      stroke={color}
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...otherProps}
    >
      <Path
        d="M15 8C8.925 8 4 12.925 4 19c0 11 13 21 20 23.326C31 40 44 30 44 19c0-6.075-4.925-11-11-11-3.72 0-7.01 1.847-9 4.674A10.987 10.987 0 0 0 15 8Z"
        stroke={color}
        strokeWidth="4"
      />
    </Svg>
  )
}

Icon.displayName = 'Like'

export const Like = memo<IconProps>(themed(Icon))
