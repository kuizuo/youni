import React from 'react';
import { Button, Text, View, YStack } from '@/ui';
import { AvatarHeaderScrollView } from 'react-native-sticky-parallax-header'
import { Stack } from 'expo-router';

export default function Screen() {
  return (
    <YStack flex={1}>

      <AvatarHeaderScrollView
        headerHeight={50}
        image={{ uri: 'https://reactnative.dev/img/tiny_logo.png' }}
        title={'kuizuo'}
        backgroundColor={'red'}
        containerStyle={{
          backgroundColor: 'blue'
        }}
        renderHeaderBar={() => {
          return <View flexDirection='row' width='100%' justifyContent="space-between" backgroundColor={'transparent'}>
            <Button>1</Button>
            <Button>2</Button>
          </View>
        }}
        enableSafeAreaTopInset={false}
        showsVerticalScrollIndicator={false}>
        <View style={{
          flex: 1,
          alignItems: 'center',
        }} paddingHorizontal={24} >
          <Text>1</Text>
          <Text>1</Text>
          <Text>1</Text>
          <Text>1</Text>
          <Text>1</Text>
          <Text>1</Text>
          <Text>1</Text>
          <Text>1</Text>
          <Text>1</Text>
          <Text>1</Text>
          <Text>1</Text>
          <Text>1</Text>
          <Text>1</Text>
          <Text>1</Text>
          <Text>1</Text>
          <Text>1</Text>
          <Text>1</Text>
          <Text>1</Text>
          <Text>2</Text>
          <Text>2</Text>
          <Text>2</Text>
          <Text>2</Text>
          <Text>2</Text>
          <Text>2</Text>
          <Text>2</Text>
          <Text>2</Text>
          <Text>2</Text>
          <Text>2</Text>
          <Text>2</Text>
          <Text>2</Text>
          <Text>2</Text>
          <Text>2</Text>
          <Text>2</Text>
          <Text>2</Text>
          <Text>2</Text>
          <Text>2</Text>
          <Text>2</Text>
          <Text>2</Text>
          <Text>2</Text>
          <Text>2</Text>
          <Text>2</Text>
          <Text>2</Text>
          <Text>2</Text>
          <Text>2</Text>
          <Text>2</Text>
          <Text>2</Text>
          <Text>2</Text>
          <Text>2</Text>
          <Text>2</Text>
          <Text>2</Text>
          <Text>2</Text>
          <Text>2</Text>
          <Text>2</Text>
          <Text>2</Text>
          <Text>2</Text>
          <Text>2</Text>
          <Text>2</Text>
          <Text>2</Text>
          <Text>2</Text>
          <Text>2</Text>
          <Text>2</Text>
          <Text>2</Text>
          <Text>2</Text>
        </View>
      </AvatarHeaderScrollView>
    </YStack>
  );
}

