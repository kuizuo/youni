import React from 'react'

import { Button, StyleSheet } from 'react-native';

import { Text, View } from '@/components/Themed';

import { Drawer } from 'react-native-drawer-layout';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TabOneScreen() {
  const [open, setOpen] = React.useState(false);

  return (
    <SafeAreaView>
      <Text>
        test
      </Text>
      <Drawer
          open={open}
          onOpen={() => setOpen(true)}
          onClose={() => setOpen(false)}
          drawerType="front"
          renderDrawerContent={() => {
            return (
              <View >
                <Button color="#f194ff" onPress={() => setOpen(false)} title='Close drawer'></Button>
              </View>
            );
          }}
        >
          <Button color="#f194ff" onPress={() => setOpen((prevOpen) => !prevOpen)} title='Close drawer'></Button>
        </Drawer>
    </SafeAreaView>

  );
}

