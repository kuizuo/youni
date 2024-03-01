import { trpc } from "@/utils/trpc";
import { View, Text } from "@/ui";
import { match } from "ts-pattern";
import { useUser } from "@/store/user";

export default function Screen() {
  const { data } = trpc.todo.list.useQuery({})

  const { profile, } = useUser()

  return (
    <View flex={1} justifyContent="center" alignItems="center">
      <Text padding={"$1"} backgroundColor={'$red10'}>{JSON.stringify(data)}</Text>
      <Text padding={"$1"} backgroundColor={'yellow'}>{JSON.stringify(profile)}</Text>
    </View>
  );
}
