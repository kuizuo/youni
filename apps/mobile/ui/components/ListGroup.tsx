import type { ReactNode } from 'react'
import React from 'react'
import { View } from '@gluestack-ui/themed'

interface GroupProps {
  children: ReactNode
  divider?: ReactNode
  [key: string]: any
}

export function ListGroup({ children, divider, ...props }: GroupProps) {
  // 将 children 转换为数组
  const childArray = React.Children.toArray(children)

  const childrenWithDividers = childArray.reduce((acc: ReactNode[], child, index) => {
    // 添加当前 child
    acc.push(child)

    // 如果有 divider 并且不是最后一个元素，添加 divider
    if (divider && index < childArray.length - 1)
      acc.push(React.cloneElement(divider as React.ReactElement, { key: `divider-${index}` }))

    return acc
  }, [])

  return (
    <View {...props}>
      {childrenWithDividers}
    </View>
  )
}
