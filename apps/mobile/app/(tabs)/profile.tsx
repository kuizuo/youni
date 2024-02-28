import { trpc } from "app/utils/trpc";
import { View, Text } from "tamagui";

export default function Screen() {

  return (
    <View flex={1} justifyContent="center" alignItems="center">
      <Text p={"$1"} bg={'$red10'}>{trpc.todo.list.useQuery({}).data}</Text>
    </View>
  );
}
