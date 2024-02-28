import { Paragraph, Spinner, VirtualList, YStack } from '@/ui'
import { CarListError } from '@/ui/cars/CarListError'
import { CarListItem } from '@/ui/cars/CarListItem'
import { trpc } from '@/utils/trpc'
import { empty, error, loading, success } from '@/utils/trpc/patterns'
import React from 'react'
import { match } from 'ts-pattern'

export const VirtualizedListScreen = (): React.ReactNode => {
  const carsList = trpc.car.all.useQuery()
  const carsListLayout = match(carsList)
    .with(error, () => <CarListError message={carsList.failureReason?.message} />)
    .with(loading, () => (
      <YStack fullscreen f={1} jc='center' ai='center'>
        <Paragraph pb='$3'>Loading...</Paragraph>
        <Spinner />
      </YStack>
    ))
    .with(empty, () => <Paragraph>No cars found.</Paragraph>)
    .with(success, () => (
      <VirtualList data={carsList.data as any[]} renderItem={CarListItem} itemHeight={80} />
    ))
    .otherwise(() => <CarListError message={carsList.failureReason?.message} />)

  return (
    <YStack fullscreen f={1}>
      {carsListLayout}
    </YStack>
  )
}
