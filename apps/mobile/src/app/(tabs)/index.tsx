import React from 'react'

import { Pressable, View, Text } from '@/components/Themed';

import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Screen() {

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['left', 'right', 'top']}>
      <Link href='/note/1' className='max-w-fit h-8 fp-4 flex items-center bg-red-500'>go to note</Link>
      <Link href="/search" asChild>
        <Pressable>
          <Text>search</Text>
        </Pressable>
      </Link>
      <View className='flex justify-center'>
        <Pressable>
          {({ pressed }) => (
            <Text >{pressed ? 'Pressed!' : 'Press Me'}</Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

