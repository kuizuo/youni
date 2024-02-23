import React from 'react'

import { Button, Pressable, StyleSheet } from 'react-native';

import { Text, View } from '@/components/Themed';

import { Link } from 'expo-router';

export default function TabOneScreen() {

  return (
    <View>
      <Link href='/note/1' className='max-w-fit h-8 fp-4 flex items-center bg-red-500'>go to note</Link>
      <Link href="/search" asChild>
      <Pressable>
        <Text>search</Text>
      </Pressable>
    </Link>
    </View>
  );
}

