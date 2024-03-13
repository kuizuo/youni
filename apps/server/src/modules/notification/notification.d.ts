export type MessageItem = Awaited<
  ReturnType<import('./notification.service').NotificationService['paginate']>
>['items'][number]
