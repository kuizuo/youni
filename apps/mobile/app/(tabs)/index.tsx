import React from 'react'

import { Button, Pressable, View, Text } from 'react-native';

import { Link } from 'expo-router';

export default function TabOneScreen() {

  return (
    <View>
      <Link href='/note/1' className='max-w-fit h-8 fp-4 flex items-center bg-red-500'>go to note</Link>
      <Link href="/search" asChild>
        <Pressable>
          <Text className='text-red-600'>search</Text>
        </Pressable>
      </Link>
      <View className='flex justify-center'>
        <Button title='button1'></Button>
        <Button title='button2'></Button>
      </View>
    </View>
  );
}

