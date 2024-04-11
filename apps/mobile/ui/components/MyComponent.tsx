import { type TamaguiComponent, YStack, styled } from '@/ui'

export const MyComponent: TamaguiComponent = styled(YStack, {
  name: 'MyComponent',

  variants: {
    blue: {
      true: {
        backgroundColor: 'blue',
      },
    },
  } as const,
})
