import { Paragraph, YStack } from '@/ui'

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
    <YStack flex={1} jc="center" ai="center" p="$6" gap="$3">
      {image}
      <Paragraph className="text-base">{title}</Paragraph>
      {subTitle && <Paragraph fontSize={10}>{subTitle}</Paragraph>}
    </YStack>
  )
}
