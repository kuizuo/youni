import { Button, Text, View } from '@gluestack-ui/themed'
import { Stack, useRouter } from 'expo-router'
import { StyleSheet } from 'react-native'

export default function NotFoundScreen() {
  const router = useRouter()

  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View style={styles.container}>
        <Text style={styles.title}>页面不存在</Text>

        <Text mt="$2" onPress={() => router.back()}>返回上一级</Text>
        <Text mt="$2" onPress={() => router.replace('/')}>返回到首页</Text>
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },

  linkText: {
    fontSize: 14,
    color: '#2e78b7',
  },
})
