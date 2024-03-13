import { HistoryScreen } from '@/features/history/screen';
import { Button } from '@/ui';
import { Stack } from 'expo-router';
import { List } from '@tamagui/lucide-icons'

export default function Screen() {
  return (
    <>
      <Stack.Screen options={{
        headerShown: true,
        headerShadowVisible: false,
        title: '浏览记录',
        headerTitleAlign: 'center',
        headerRight: () => {
          return <Button
            size={'$2'}
            borderRadius={50}
            marginRight="$2"
            icon={<List ></List>}
            onPress={() => alert('This is a button!')}
          >
            管理
          </Button>
        },
      }} />
      <HistoryScreen />
    </>
  );
}