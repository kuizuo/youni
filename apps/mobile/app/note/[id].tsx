import { Link, Stack, useLocalSearchParams } from 'expo-router';
import { Avatar, Text, XStack } from '@/ui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { trpc } from '@/utils/trpc';
import React from 'react';

export default function Screen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data } = trpc.note.byId.useQuery({ id })

  return <>
    <SafeAreaView style={{ flex: 1 }}>
      <Stack.Screen options={{
        headerShown: true,
        headerTitle: () => <>
          <Link href={`/user/${data?.user.id}`} asChild>
            <XStack gap='$2.5' alignItems='center'>
              <Avatar circular size="$2">
                <Avatar.Image
                  src={data?.user.avatar!}
                />
                <Avatar.Fallback />
              </Avatar>
              <Text fontSize={14} opacity={0.7} >
                {data?.user.nickname}
              </Text>
            </XStack>
          </Link>
        </>
      }} />
      <Text>Note : {id}</Text>
    </SafeAreaView>
  </>;
}