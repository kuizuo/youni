
import { FlashList } from "@shopify/flash-list"
import { MessageListItem } from "./MessageListItem"
import { MessageItem } from "@server/modules/notification/notification"
import { RefreshControl } from "react-native-gesture-handler"

type Props = {
  data: MessageItem[]
  isRefreshing: boolean
  onRefresh: () => void
  onEndReached: () => void
}

export const MessageList = ({
  data,
  isRefreshing,
  onRefresh,
  onEndReached,
}: Props) => {
  return <FlashList
    data={data}
    renderItem={({ item }) => <MessageListItem {...item}></MessageListItem>}
    keyExtractor={(item) => item.id}
    refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
    onEndReached={onEndReached}
    estimatedItemSize={200}
  />
}