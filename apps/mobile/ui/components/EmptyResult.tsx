import { Paragraph, ScrollView, YStack } from '@/ui'
import { RefreshControl } from 'react-native-gesture-handler'

interface Props {
  title: string | undefined
  subTitle?: string | undefined
  image?: React.ReactNode
  isRefreshing?: boolean
  onRefresh?: () => void
}

export const EmptyResult = ({
  title,
  subTitle,
  image,
  isRefreshing,
  onRefresh
}: Props): React.ReactElement => {
  return (
    <ScrollView
      refreshControl={isRefreshing ? <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} /> : <></>}
    >
      <YStack flex={1} justifyContent='center' alignItems='center' padding='$6' gap='$3'>
        {image}
        <Paragraph fontSize={16}>{title}</Paragraph>
        {subTitle && <Paragraph fontSize={10}>{subTitle}</Paragraph>}
      </YStack>
    </ScrollView>
  )
}
