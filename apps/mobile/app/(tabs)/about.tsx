
import { Text, View } from '@/components/Themed';

import { trpc } from "@/utils/api";

export default function AboutScreen() {

  const { data } = trpc.todo.list.useQuery({});
  console.log(data)
  return (
    <View className="flex-1 items-center justify-center bg-black">
      <Text className='w-10 h-10 bg-red-400'>Box</Text>
      <Text>{JSON.stringify(data)}</Text>
    </View>
  );
}
