import { RefreshControl } from 'react-native-gesture-handler'
import { Paragraph, ScrollView, YStack } from '@/ui'

interface Props {
  title: string | undefined
  subTitle?: string | undefined
  image?: React.ReactNode
  isRefreshing?: boolean
  onRefresh?: () => void
}

export function EmptyResult({
  title,
  subTitle,
  image,
  isRefreshing,
  onRefresh,
}: Props): React.ReactElement {
  return (
    <ScrollView
      refreshControl={isRefreshing ? <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} /> : <></>}
    >
      <YStack flex={1} jc="center" ai="center" p="$6" gap="$3">
        {image}
        <Paragraph fontSize={16}>{title}</Paragraph>
        {subTitle && <Paragraph fontSize={10}>{subTitle}</Paragraph>}
      </YStack>
    </ScrollView>
  )
}
