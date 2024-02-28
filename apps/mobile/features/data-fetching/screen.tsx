import { H1, H2, Paragraph, YStack } from '@/ui'
import { trpc } from '@/utils/trpc'
import { match } from 'ts-pattern'
import { error, loading, success } from '@/utils/trpc/patterns'

export function DataFetchingScreen() {
  const helloWorld = trpc.todo.list.useQuery({})
  
  const helloWorldLayout = match(helloWorld)
    .with(error, () => <Paragraph>{helloWorld.failureReason?.message}</Paragraph>)
    .with(loading, () => <Paragraph>Loading...</Paragraph>)
    .with(success, () => <Paragraph>{helloWorld.data}</Paragraph>)
    .otherwise(() => <Paragraph>{helloWorld.failureReason?.message}</Paragraph>)


  return (
    <YStack flex={1} justifyContent='center' alignItems='center' padding='$4' gap='$4'>
      <H1>Data Fetching</H1>
      <H2>Public Route</H2>
      {helloWorldLayout}
    </YStack>
  )
}
