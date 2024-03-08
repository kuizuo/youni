import { FlashList } from "@shopify/flash-list"
import { UserListItem } from "./UserListItem"
import { UserInfo } from "@server/modules/user/user"

type Props = {
  data: UserInfo[]
  isLoading: boolean
}

export const UserList = ({ data, isLoading }: Props) => {
  return <FlashList
    data={data}
    renderItem={({ item }) => <UserListItem {...item}></UserListItem>}
    estimatedItemSize={200}
  />
}