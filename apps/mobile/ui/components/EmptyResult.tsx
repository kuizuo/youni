import { Heading, Text, View } from '@gluestack-ui/themed'

interface Props {
  title: string | undefined
  subTitle?: string | undefined
  image?: React.ReactNode
}

export function EmptyResult({
  title,
  subTitle,
  image,
}: Props): React.ReactElement {
  return (
    <View className="flex-1 justify-center items-center p-6 gap-3">
      {image}
      <Heading size="md" color="$secondary600">{title}</Heading>
      {subTitle && <Text>{subTitle}</Text>}
    </View>
  )
}
