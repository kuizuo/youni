import React from 'react';
import { Text, View } from '@/ui';
import { AvatarHeaderScrollView } from 'react-native-sticky-parallax-header'

export default function Screen() {
  return (
    <View style={{ flex: 1 }}>
      <AvatarHeaderScrollView

        headerHeight={50}
        image={{ uri: 'https://reactnative.dev/img/tiny_logo.png' }}
        title={'kuizuo'}
        backgroundColor={'red'}
        containerStyle={{
          backgroundColor: 'blue'
        }}
        enableSafeAreaTopInset={false}
        showsVerticalScrollIndicator={false}>
        <View style={{
          flex: 1,
          alignItems: 'center',
        }} paddingHorizontal={24} >
          <Text>1</Text>
          <View flex={1}>
            <Text>2</Text>
          </View>
        </View>
      </AvatarHeaderScrollView>
    </View>
  );
}

