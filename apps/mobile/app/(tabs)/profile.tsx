import { trpc } from "@/utils/trpc";
import { View, Text } from "@/ui";

export default function Screen() {

  return (
    <View flex={1} justifyContent="center" alignItems="center">
      <Text padding={"$1"} backgroundColor={'$red10'}>{trpc.todo.list.useQuery({}).data}</Text>
    </View>
  );
}
