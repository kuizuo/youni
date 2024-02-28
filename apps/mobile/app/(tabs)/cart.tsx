import React from 'react'

import { Button, Text, View } from 'react-native';

import { Drawer } from 'react-native-drawer-layout';

export default function TabOneScreen() {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <Drawer
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        drawerType="front"
        renderDrawerContent={() => {
          return (
            <View>
              <Button color="#f194ff" onPress={() => setOpen(false)} title='Close drawer'></Button>
            </View>
          );
        }}
      >
        <Button color="#f194ff" onPress={() => setOpen((prevOpen) => !prevOpen)} title='Close drawer'></Button>
      </Drawer>
    </>

  );
}

