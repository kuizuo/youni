import { trpc } from "@/utils/trpc";
import { View, Text } from "@/ui";
import { useUser } from "@/utils/auth/hooks/useUser";

export default function Screen() {

  const { profile } = useUser()

  return (
    <View flex={1} justifyContent="center" alignItems="center">
      <Text padding={"$1"} backgroundColor={'yellow'}>{JSON.stringify(profile)}</Text>
    </View>
  );
}
