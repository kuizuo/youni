import { type TamaguiComponent, YStack, styled } from 'tamagui'

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
